; Complete Inno Setup Script for Inventory & POS System Installer

[Setup]
AppName=InventoryPOS
AppVersion=1.0
DefaultDirName={pf}\InventoryPOS
DefaultGroupName=InventoryPOS
OutputBaseFilename=InventoryPOSInstaller
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked

[Files]
Source: "..\app\backend\*"; DestDir: "{app}\backend"; Flags: recursesubdirs createallsubdirs
Source: "..\app\frontend\*"; DestDir: "{app}\frontend"; Flags: recursesubdirs createallsubdirs
Source: "..\scripts\backup_and_installer_setup.bat"; DestDir: "{app}\scripts"; Flags: ignoreversion
Source: "..\start-backend.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\start-frontend.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Start Backend Server"; Filename: "{app}\start-backend.bat"
Name: "{group}\Start Frontend Server"; Filename: "{app}\start-frontend.bat"
Name: "{userdesktop}\InventoryPOS Backend Server"; Filename: "{app}\start-backend.bat"; Tasks: desktopicon
Name: "{userdesktop}\InventoryPOS Frontend Server"; Filename: "{app}\start-frontend.bat"; Tasks: desktopicon

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
var
  EnvFile: string;
  EnvContent: string;
begin
  if CurStep = ssPostInstall then
  begin
    EnvFile := ExpandConstant('{app}\backend\.env');
    EnvContent := '; Please create this file manually with your environment variables' + #13#10 +
                  '; Example:' + #13#10 +
                  'DATABASE_URL=your_postgresql_connection_string' + #13#10 +
                  'JWT_SECRET=your_jwt_secret_key' + #13#10;
    SaveStringToFile(EnvFile, EnvContent, False);
  end;
end;
