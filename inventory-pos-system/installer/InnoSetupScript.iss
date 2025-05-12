; Inno Setup Script for Inventory & POS System Installer

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
Source: "..\start-backend.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\start-frontend.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Start Backend Server"; Filename: "{app}\start-backend.bat"
Name: "{group}\Start Frontend Server"; Filename: "{app}\start-frontend.bat"
Name: "{userdesktop}\InventoryPOS Backend Server"; Filename: "{app}\start-backend.bat"; Tasks: desktopicon
Name: "{userdesktop}\InventoryPOS Frontend Server"; Filename: "{app}\start-frontend.bat"; Tasks: desktopicon

[Code]
var
  DatabaseURL, JWTSecret: string;

function InitializeSetup(): Boolean;
begin
  Result := True;
  if not InputQuery('Environment Variables', 'Enter DATABASE_URL:', DatabaseURL) then
  begin
    MsgBox('DATABASE_URL is required. Setup will exit.', mbError, MB_OK);
    Result := False;
    Exit;
  end;
  if not InputQuery('Environment Variables', 'Enter JWT_SECRET:', JWTSecret) then
  begin
    MsgBox('JWT_SECRET is required. Setup will exit.', mbError, MB_OK);
    Result := False;
    Exit;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  EnvFile: string;
  EnvContent: string;
begin
  if CurStep = ssPostInstall then
  begin
    EnvFile := ExpandConstant('{app}\backend\.env');
    EnvContent := 'DATABASE_URL=' + DatabaseURL + #13#10 + 'JWT_SECRET=' + JWTSecret + #13#10;
    SaveStringToFile(EnvFile, EnvContent, False);
  end;
end;
