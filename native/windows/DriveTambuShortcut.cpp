// Drive Tambu Windows shortcut: one bounded read-only query, then ShellExecute or legacy fallback.
// The same binary runs a constrained named-pipe broker as a child of the Electron main process.
// Neither mode mounts, unmounts, enumerates remote files, writes a config nor modifies a shortcut.
#define UNICODE
#define _UNICODE
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <shellapi.h>
#include <sddl.h>
#include <winioctl.h>
#include <string>
#include <vector>
#include <array>
#include <algorithm>
#include <cstdio>
#include <cwctype>
#include <cwchar>
#include <cstdlib>
#include <iostream>

#pragma comment(lib, "advapi32.lib")
#pragma comment(lib, "shell32.lib")

static bool validId(const std::wstring &id) {
  if (id.size()<6 || id.size()>80) return false;
  for (wchar_t c: id) if (!((c>=L'a'&&c<=L'z')||(c>=L'A'&&c<=L'Z')||(c>=L'0'&&c<=L'9')||c==L'-')) return false;
  return true;
}
static std::string utf8(const std::wstring &w) {
  if (w.empty()) return {};
  int n=WideCharToMultiByte(CP_UTF8,WC_ERR_INVALID_CHARS,w.c_str(),(int)w.size(),nullptr,0,nullptr,nullptr);
  if(!n) return {};
  std::string out(n,'\0');
  return WideCharToMultiByte(CP_UTF8,WC_ERR_INVALID_CHARS,w.c_str(),(int)w.size(),out.data(),n,nullptr,nullptr) ? out : std::string();
}
static std::wstring wide(const std::string &s) {
  if(s.empty()) return {};
  int n=MultiByteToWideChar(CP_UTF8,MB_ERR_INVALID_CHARS,s.data(),(int)s.size(),nullptr,0);
  if(!n) return {};
  std::wstring out(n,L'\0');
  return MultiByteToWideChar(CP_UTF8,MB_ERR_INVALID_CHARS,s.data(),(int)s.size(),out.data(),n) ? out : std::wstring();
}
static std::wstring ownPath() {
  std::wstring s(32768, L'\0');
  DWORD n=GetModuleFileNameW(nullptr,s.data(),(DWORD)s.size());
  if(!n || n>=s.size()) return {};
  s.resize(n);return s;
}
static std::wstring ownDirectory() {
  std::wstring p=ownPath();const auto cut=p.find_last_of(L"\\/");
  return cut==std::wstring::npos ? std::wstring() : p.substr(0,cut+1);
}
static std::wstring logonSid() {
  HANDLE token=nullptr;
  if(!OpenProcessToken(GetCurrentProcess(),TOKEN_QUERY,&token)) return {};
  DWORD size=0;GetTokenInformation(token,TokenGroups,nullptr,0,&size);
  std::vector<BYTE> buf(size);
  std::wstring found;
  if(size && GetTokenInformation(token,TokenGroups,buf.data(),size,&size)) {
    auto *groups=reinterpret_cast<TOKEN_GROUPS*>(buf.data());
    for(DWORD i=0;i<groups->GroupCount;i++) {
      if((groups->Groups[i].Attributes&SE_GROUP_LOGON_ID)==SE_GROUP_LOGON_ID) {
        LPWSTR sid=nullptr;
        if(ConvertSidToStringSidW(groups->Groups[i].Sid,&sid)) {found=sid;LocalFree(sid);}
        break;
      }
    }
  }
  CloseHandle(token);return found;
}
static std::wstring pipeName() {
  const auto sid=logonSid();
  return sid.empty() ? std::wstring() : L"\\\\.\\pipe\\DriveTambuShortcut-v1-"+sid;
}
static bool ioWithDeadline(HANDLE pipe, bool read, void *buffer, DWORD size, DWORD &count, DWORD ms, HANDLE parent=INVALID_HANDLE_VALUE) {
  OVERLAPPED ov{};ov.hEvent=CreateEventW(nullptr,TRUE,FALSE,nullptr);
  if(!ov.hEvent)return false;
  count=0;
  BOOL ok = read ? ReadFile(pipe,buffer,size,&count,&ov) : WriteFile(pipe,buffer,size,&count,&ov);
  if(!ok && GetLastError()==ERROR_IO_PENDING) {
    HANDLE handles[2]={ov.hEvent,parent};DWORD n=parent==INVALID_HANDLE_VALUE?1:2;
    DWORD wait=WaitForMultipleObjects(n,handles,FALSE,ms);
    if(wait==WAIT_OBJECT_0)ok=GetOverlappedResult(pipe,&ov,&count,FALSE);
    else {CancelIoEx(pipe,&ov);GetOverlappedResult(pipe,&ov,&count,TRUE);ok=FALSE;}
  }
  CloseHandle(ov.hEvent);
  return ok && count>0;
}
static bool sameImageAsLauncher(HANDLE pipe) {
  ULONG pid=0;
  if(!GetNamedPipeServerProcessId(pipe,&pid)||!pid) return false;
  HANDLE process=OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION,FALSE,pid);
  if(!process)return false;
  std::wstring s(32768,L'\0');DWORD len=(DWORD)s.size();
  bool ok=QueryFullProcessImageNameW(process,0,s.data(),&len)!=0;
  CloseHandle(process);
  if(!ok)return false;
  s.resize(len);return _wcsicmp(s.c_str(),ownPath().c_str())==0;
}
static bool fetchReadyPath(const std::wstring &id, std::wstring &path) {
  auto name=pipeName();if(name.empty())return false;
  // Absent pipe is immediate; a starting/busy server gets a finite grace interval.
  HANDLE p=CreateFileW(name.c_str(),GENERIC_READ|GENERIC_WRITE,0,nullptr,OPEN_EXISTING,FILE_FLAG_OVERLAPPED,nullptr);
  if(p==INVALID_HANDLE_VALUE && GetLastError()==ERROR_PIPE_BUSY && WaitNamedPipeW(name.c_str(),200))
    p=CreateFileW(name.c_str(),GENERIC_READ|GENERIC_WRITE,0,nullptr,OPEN_EXISTING,FILE_FLAG_OVERLAPPED,nullptr);
  if(p==INVALID_HANDLE_VALUE)return false;
  bool okay=sameImageAsLauncher(p);
  const std::string request="CHECK\t"+utf8(id)+"\n";
  DWORD sent=0;
  if(okay)okay=ioWithDeadline(p,false,(void*)request.data(),(DWORD)request.size(),sent,350);
  std::array<char,8192> response{};DWORD read=0;
  if(okay)okay=ioWithDeadline(p,true,response.data(),(DWORD)(response.size()-1),read,450);
  CloseHandle(p);
  if(!okay)return false;
  const std::string result(response.data(),read);
  if(result.rfind("READY\t",0)!=0 || result.empty() || result.back()!='\n')return false;
  auto text=result.substr(6,result.size()-7);
  if(text.find_first_of("\r\n\t\0")!=std::string::npos)return false;
  path=wide(text);
  return path.size()>=4 && path.size()<=2048 &&
    ((path[0]>=L'A'&&path[0]<=L'Z')||(path[0]>=L'a'&&path[0]<=L'z')) &&
    path[1]==L':' && path[2]==L'\\';
}
// A junction by itself is NEVER a sufficient readiness signal. Only the specifically
// WinFsp-looking device target plus the live application's read-only READY may open fast.
// Exact target formats require a real WinFsp test; uncertain paths fall back to Electron.
static bool looksLikeWinFspMount(const std::wstring &p) {
  DWORD attr=GetFileAttributesW(p.c_str());
  if(attr==INVALID_FILE_ATTRIBUTES || !(attr&FILE_ATTRIBUTE_DIRECTORY) || !(attr&FILE_ATTRIBUTE_REPARSE_POINT))return false;
  HANDLE h=CreateFileW(p.c_str(),FILE_READ_EA,FILE_SHARE_READ|FILE_SHARE_WRITE|FILE_SHARE_DELETE,
    nullptr,OPEN_EXISTING,FILE_FLAG_OPEN_REPARSE_POINT|FILE_FLAG_BACKUP_SEMANTICS,nullptr);
  if(h==INVALID_HANDLE_VALUE)return false;
  std::array<BYTE,MAXIMUM_REPARSE_DATA_BUFFER_SIZE> data{};DWORD used=0;
  bool ok=DeviceIoControl(h,FSCTL_GET_REPARSE_POINT,nullptr,0,data.data(),(DWORD)data.size(),&used,nullptr)!=0;
  CloseHandle(h);
  if(!ok || used<REPARSE_DATA_BUFFER_HEADER_SIZE)return false;
  const auto *reparse=reinterpret_cast<const REPARSE_DATA_BUFFER*>(data.data());
  if(reparse->ReparseTag!=IO_REPARSE_TAG_MOUNT_POINT)return false;
  const auto &mp=reparse->MountPointReparseBuffer;
  const size_t start=mp.SubstituteNameOffset / sizeof(wchar_t),length=mp.SubstituteNameLength / sizeof(wchar_t);
  const size_t bytes=FIELD_OFFSET(REPARSE_DATA_BUFFER,MountPointReparseBuffer.PathBuffer);
  if(bytes>used || mp.SubstituteNameOffset%2 || mp.SubstituteNameLength%2 || (start+length)>(used-bytes)/sizeof(wchar_t))return false;
  std::wstring target(mp.PathBuffer+start,length);
  std::transform(target.begin(),target.end(),target.begin(),[](wchar_t x){return (wchar_t)towlower(x);});
  // Deliberately narrow. False negatives preserve the legacy shortcut behavior.
  return target.find(L"winfsp")!=std::wstring::npos && (target.find(L"\\device\\")!=std::wstring::npos || target.find(L"\\??\\")!=std::wstring::npos);
}
static bool openFolder(const std::wstring &path) {
  SHELLEXECUTEINFOW info{};info.cbSize=sizeof(info);info.fMask=SEE_MASK_FLAG_NO_UI|SEE_MASK_NOASYNC;
  info.lpVerb=L"open";info.lpFile=path.c_str();info.nShow=SW_SHOWNORMAL;
  return ShellExecuteExW(&info)!=FALSE;
}
static int legacyOpen(const std::wstring &id) {
  const auto exe=ownDirectory()+L"Drive Tambu.exe";
  if(GetFileAttributesW(exe.c_str())==INVALID_FILE_ATTRIBUTES)return 2;
  std::wstring command=L"\""+exe+L"\" -- --open-folder "+id;
  STARTUPINFOW si{};si.cb=sizeof(si);PROCESS_INFORMATION pi{};
  if(!CreateProcessW(exe.c_str(),command.data(),nullptr,nullptr,FALSE,CREATE_NO_WINDOW,nullptr,nullptr,&si,&pi))return 3;
  CloseHandle(pi.hThread);CloseHandle(pi.hProcess);return 0;
}
static int serve(DWORD parentPid) {
  HANDLE parent=OpenProcess(SYNCHRONIZE,FALSE,parentPid);
  if(!parent)return 5;
  const auto name=pipeName();if(name.empty()){CloseHandle(parent);return 6;}
  const auto sid=logonSid();
  const auto sddl=L"D:P(A;;GA;;;SY)(A;;GA;;;"+sid+L")";
  PSECURITY_DESCRIPTOR descriptor=nullptr;
  if(!ConvertStringSecurityDescriptorToSecurityDescriptorW(sddl.c_str(),SDDL_REVISION_1,&descriptor,nullptr)) {CloseHandle(parent);return 7;}
  SECURITY_ATTRIBUTES sa{sizeof(sa),descriptor,FALSE};
  bool running=true;
  while(running && WaitForSingleObject(parent,0)==WAIT_TIMEOUT) {
    HANDLE pipe=CreateNamedPipeW(name.c_str(),PIPE_ACCESS_DUPLEX|FILE_FLAG_OVERLAPPED|FILE_FLAG_FIRST_PIPE_INSTANCE,
      PIPE_TYPE_MESSAGE|PIPE_READMODE_MESSAGE|PIPE_WAIT|PIPE_REJECT_REMOTE_CLIENTS,1,8192,512,200,&sa);
    if(pipe==INVALID_HANDLE_VALUE)break;
    OVERLAPPED ov{};ov.hEvent=CreateEventW(nullptr,TRUE,FALSE,nullptr);
    if(!ov.hEvent){CloseHandle(pipe);break;}
    BOOL connected=ConnectNamedPipe(pipe,&ov);
    if(!connected && GetLastError()==ERROR_PIPE_CONNECTED)connected=TRUE;
    if(!connected && GetLastError()==ERROR_IO_PENDING) {
      HANDLE waits[2]={ov.hEvent,parent};
      DWORD state=WaitForMultipleObjects(2,waits,FALSE,200);
      if(state==WAIT_OBJECT_0)connected=TRUE;
      else if(state==WAIT_OBJECT_0+1)running=false;
      if(!connected){CancelIoEx(pipe,&ov);DWORD ignored=0;GetOverlappedResult(pipe,&ov,&ignored,TRUE);}
    }
    CloseHandle(ov.hEvent);
    if(connected) {
      std::array<char,256> request{};DWORD bytes=0;
      if(ioWithDeadline(pipe,true,request.data(),(DWORD)request.size()-1,bytes,450,parent)) {
        const std::string line(request.data(),bytes);
        if(line.rfind("CHECK\t",0)==0 && line.back()=='\n' && bytes<120) {
          std::wstring id=wide(line.substr(6,line.size()-7));
          if(validId(id)) {
            std::cout << "CHECK\t" << utf8(id) << "\n" << std::flush;
            std::string reply;
            if(std::getline(std::cin,reply) && reply.size()<8100 && reply.find('\r')==std::string::npos) {
              reply.push_back('\n');DWORD wrote=0;
              ioWithDeadline(pipe,false,(void*)reply.data(),(DWORD)reply.size(),wrote,450,parent);
            } else running=false;
          }
        }
      }
      DisconnectNamedPipe(pipe);
    }
    CloseHandle(pipe);
  }
  LocalFree(descriptor);CloseHandle(parent);return 0;
}
int WINAPI wWinMain(HINSTANCE,HINSTANCE,LPWSTR,int) {
  int count=0;LPWSTR *args=CommandLineToArgvW(GetCommandLineW(),&count);
  if(!args)return 8;
  int result=1;
  if(count==2 && wcscmp(args[1],L"--self-test")==0) result=validId(L"folder-123")&&!validId(L"../bad")?0:9;
  else if(count==4 && wcscmp(args[1],L"--serve")==0 && wcscmp(args[2],L"--parent")==0) {
    wchar_t *end=nullptr;unsigned long pid=wcstoul(args[3],&end,10);
    if(end && !*end && pid>0 && pid<=0xffffffffUL)result=serve((DWORD)pid);
  } else if(count==3 && wcscmp(args[1],L"--open-folder")==0 && validId(args[2])) {
    std::wstring path;
    if(fetchReadyPath(args[2],path) && looksLikeWinFspMount(path) && openFolder(path))result=0;
    else result=legacyOpen(args[2]);
  }
  LocalFree(args);return result;
}
