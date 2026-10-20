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
  Var dtLinksCheckbox
  Var dtBackupsCheckbox
  Var dtManageButton
  Var dtResetSelected
  Var dtLinksSelected
  Var dtBackupsSelected
  Var dtResetAllowed
  Var dtPage

  !macro customUnInit
    StrCpy $dtResetSelected 0
    StrCpy $dtLinksSelected 0
    StrCpy $dtBackupsSelected 0
    StrCpy $dtResetAllowed 0
    ; Reject stock delete-app-data flag: this uninstaller uses an exact allowlist.
    ClearErrors
    ${GetParameters} $R0
    ${GetOptions} $R0 "--delete-app-data" $R1
    ${IfNot} ${Errors}
      SetErrorLevel 2
      Quit
    ${EndIf}
    ; Do not clean a different account, an elevated install or an update.
    ReadRegStr $R0 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
    ${If} $R0 == $INSTDIR
    ${AndIf} $installMode == "CurrentUser"
      StrCpy $dtResetAllowed 1
    ${EndIf}
  !macroend

  !macro customUnWelcomePage
    UninstPage custom un.DriveSettingsPage un.DriveSettingsLeave
  !macroend

  !macro customHeader
  Function un.OpenComponents
    ExecShell open "ms-settings:appsfeatures"
  FunctionEnd

  Function un.DriveSettingsPage
    ${If} ${Silent}
      Abort
    ${EndIf}
    ${If} ${isUpdated}
      Abort
    ${EndIf}
    !insertmacro MUI_HEADER_TEXT "Disinstalla Drive Tambu" "Scegli quali dati conservare. Tutte le opzioni sono disattivate."
    nsDialogs::Create 1018
    Pop $dtPage
    ${If} $dtPage == error
      Abort
    ${EndIf}
    ${NSD_CreateLabel} 0u 0u 100% 26u "I file sul server e le installazioni autonome di rclone, OpenSSH e WinFsp non saranno rimossi."
    Pop $R0
    ${NSD_CreateCheckbox} 0u 33u 100% 18u "Elimina impostazioni"
    Pop $dtResetCheckbox
    ${NSD_Uncheck} $dtResetCheckbox
    ${NSD_CreateCheckbox} 0u 55u 100% 18u "Elimina collegamenti creati dall'app"
    Pop $dtLinksCheckbox
    ${NSD_Uncheck} $dtLinksCheckbox
    ${NSD_CreateCheckbox} 0u 77u 100% 18u "Elimina backup verificati (anteprima e seconda conferma)"
    Pop $dtBackupsCheckbox
    ${NSD_Uncheck} $dtBackupsCheckbox
    ${If} $dtResetAllowed != 1
      EnableWindow $dtResetCheckbox 0
      EnableWindow $dtLinksCheckbox 0
      EnableWindow $dtBackupsCheckbox 0
    ${EndIf}
    ${NSD_CreateLabel} 0u 103u 100% 43u "Solo i percorsi riconosciuti saranno eliminabili. Per i backup verra richiesta una conferma esplicita di cancellazione di TUTTO il contenuto, inclusi file personali aggiunti manualmente."
    Pop $R0
    ${NSD_CreateButton} 0u 152u 75% 24u "Gestisci componenti di sistema"
    Pop $dtManageButton
    ${NSD_OnClick} $dtManageButton un.OpenComponents
    nsDialogs::Show
  FunctionEnd

  Function un.DriveSettingsLeave
    ${NSD_GetState} $dtResetCheckbox $dtResetSelected
    ${NSD_GetState} $dtLinksCheckbox $dtLinksSelected
    ${NSD_GetState} $dtBackupsCheckbox $dtBackupsSelected
  FunctionEnd
  !macroend

  !macro customUnInstall
    ${IfNot} ${Silent}
    ${AndIfNot} ${isUpdated}
    ${AndIf} $dtResetAllowed == 1
    ${AndIf} $installMode == "CurrentUser"
      ${If} $dtResetSelected == ${BST_CHECKED}
      ${OrIf} $dtLinksSelected == ${BST_CHECKED}
      ${OrIf} $dtBackupsSelected == ${BST_CHECKED}
        ; Stage into NSIS's private temporary directory before $INSTDIR is removed.
        ; The script independently verifies REPARSE_POINT, FileId, marker and paths.
        ; Exact known settings: config.json, config.json.before-0.2.bak,
        ; config.json.before-0.3.bak, shortcuts-v1.json, connections-v1.
        InitPluginsDir
        File /oname=$PLUGINSDIR\uninstall-cleanup.ps1 "${BUILD_RESOURCES_DIR}\uninstall-cleanup.ps1"
        ExecWait '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$PLUGINSDIR\uninstall-cleanup.ps1" -InstallDir "$INSTDIR" -RemovePreferences $dtResetSelected -RemoveShortcuts $dtLinksSelected -RemoveBackups $dtBackupsSelected' $R0
        ${If} $R0 != 0
          DetailPrint "Pulizia facoltativa annullata o incompleta ($R0). I dati non riconosciuti vengono conservati."
        ${EndIf}
      ${EndIf}
    ${EndIf}
  !macroend
!endif
