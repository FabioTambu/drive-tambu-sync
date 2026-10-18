; Extend the stock assisted installer. Do not terminate the application on its behalf.
!include "LogicLib.nsh"
!include "nsDialogs.nsh"
!ifndef nsProcess::FindProcess
  !include "nsProcess.nsh"
!endif

!macro customCheckAppRunning
  dt_check_again:
  ${nsProcess::FindProcess} "${APP_EXECUTABLE_FILENAME}" $R0
  ${If} $R0 == 603
    Goto dt_app_closed
  ${EndIf}
  ${If} $R0 != 0
    IfSilent +2
      MessageBox MB_OK|MB_ICONEXCLAMATION "Non riesco a verificare se Drive Tambu e aperto. Installazione annullata."
    SetErrorLevel 2
    Quit
  ${EndIf}
  ${If} ${Silent}
    SetErrorLevel 2
    Quit
  ${EndIf}
  IfFileExists "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0 +2
    Exec '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" --request-exit'
  MessageBox MB_RETRYCANCEL|MB_ICONINFORMATION "Drive Tambu e ancora aperto. Completa la chiusura nella sua finestra, poi premi Riprova. Se ci sono trasferimenti in corso, attendi il loro completamento." /SD IDCANCEL IDRETRY dt_check_again
  SetErrorLevel 2
  Quit
  dt_app_closed:
!macroend

!ifdef BUILD_UNINSTALLER
  Var dtResetCheckbox
  Var dtResetSelected
  Var dtResetAllowed
  Var dtPage

  !macro customUnInit
    StrCpy $dtResetSelected 0
    StrCpy $dtResetAllowed 0
    ; Reject the stock broad deletion flag: reset is deliberately an exact allowlist.
    ClearErrors
    ${GetParameters} $R0
    ${GetOptions} $R0 "--delete-app-data" $R1
    ${IfNot} ${Errors}
      SetErrorLevel 2
      Quit
    ${EndIf}
    ; An elevated/different account must not clean a profile belonging to somebody else.
    ReadRegStr $R0 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
    ${If} $R0 == $INSTDIR
    ${AndIf} $installMode == "CurrentUser"
      StrCpy $dtResetAllowed 1
    ${EndIf}
  !macroend

  !macro customUnWelcomePage
    UninstPage custom un.DriveSettingsPage un.DriveSettingsLeave
  !macroend

  ; The stock script inserts this hook after MUI2 and its pages are initialized.
  !macro customHeader
  Function un.DriveSettingsPage
    ${If} ${Silent}
      Abort
    ${EndIf}
    ${If} ${isUpdated}
      Abort
    ${EndIf}
    !insertmacro MUI_HEADER_TEXT "Disinstalla Drive Tambu" "Scegli se conservare le impostazioni per una futura installazione."
    nsDialogs::Create 1018
    Pop $dtPage
    ${If} $dtPage == error
      Abort
    ${EndIf}
    ${NSD_CreateLabel} 0u 0u 100% 32u "I file sul server, i backup locali e le credenziali restano al loro posto."
    Pop $R0
    ${NSD_CreateCheckbox} 0u 42u 100% 28u "Elimina anche le impostazioni di Drive Tambu"
    Pop $dtResetCheckbox
    ${NSD_Uncheck} $dtResetCheckbox
    ${If} $dtResetAllowed != 1
      EnableWindow $dtResetCheckbox 0
    ${EndIf}
    ${NSD_CreateLabel} 0u 80u 100% 44u "Senza spunta ritroverai le cartelle e le preferenze alla reinstallazione. La spunta rimuove solo le impostazioni di questo utente, non la cache dei trasferimenti."
    Pop $R0
    nsDialogs::Show
  FunctionEnd

  Function un.DriveSettingsLeave
    ${NSD_GetState} $dtResetCheckbox $dtResetSelected
  FunctionEnd

  ; $R3 is one known configuration directory. No recursion and no wildcards.
  Function un.RemoveDrivePreferences
    System::Call 'kernel32::GetFileAttributesW(w "$R3") i.s'
    Pop $R4
    ${If} $R4 == -1
      Return
    ${EndIf}
    IntOp $R5 $R4 & 0x400 ; FILE_ATTRIBUTE_REPARSE_POINT
    ${If} $R5 != 0
      Return
    ${EndIf}
    StrCpy $R6 "$R3\config.json"
    Call un.RemoveOnePreference
    StrCpy $R6 "$R3\config.json.before-0.2.bak"
    Call un.RemoveOnePreference
    StrCpy $R6 "$R3\config.json.before-0.3.bak"
    Call un.RemoveOnePreference
  FunctionEnd

  Function un.RemoveOnePreference
    System::Call 'kernel32::GetFileAttributesW(w "$R6") i.s'
    Pop $R4
    ${If} $R4 == -1
      Return
    ${EndIf}
    IntOp $R5 $R4 & 0x410 ; refuse reparse points and directories
    ${If} $R5 == 0
      ClearErrors
      Delete "$R6"
      ${If} ${Errors}
        DetailPrint "Impostazione non rimossa: $R6"
      ${EndIf}
    ${EndIf}
  FunctionEnd

  !macroend

  !macro customUnInstall
    ${IfNot} ${Silent}
    ${AndIfNot} ${isUpdated}
    ${AndIf} $dtResetAllowed == 1
    ${AndIf} $installMode == "CurrentUser"
    ${AndIf} $dtResetSelected == ${BST_CHECKED}
      ; The app-running check runs before this hook, also for manual uninstall.
      StrCpy $R3 "$APPDATA\Drive Tambu"
      Call un.RemoveDrivePreferences
      StrCpy $R3 "$APPDATA\drive-tambu"
      Call un.RemoveDrivePreferences
    ${EndIf}
  !macroend
!endif
