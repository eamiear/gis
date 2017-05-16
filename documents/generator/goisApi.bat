@echo off

REM jsdoc3\templates\%TEMPLATE%
SET TEMPLATE=jsdoc3Template

REM jsdoc3\doc\%OUTPUT_DIR%
SET OUTPUT_DIR=gois-api\

REM jsdoc3\src\%INPUT_DIR%
SET INPUT_DIR=gois\src\

REM Working Copy, it's not be altered
SET ORIGINAL_SOURCE="..\..\src\extras\"

echo Erasing old documentation

IF EXIST "..\doc\%OUTPUT_DIR%" (
    del /F/S/Q "..\doc\%OUTPUT_DIR%"
) ELSE ( 
    echo "Making doc\%OUTPUT_DIR% directory"
    md "..\doc\%OUTPUT_DIR%"

)
echo          Done!

echo Erasing Old Sources
IF EXIST ".\src\%INPUT_DIR%" ( 
    del /F/S/Q ".\src\%INPUT_DIR%"
) ELSE ( 
    echo "Making src\%INPUT_DIR% directory"
    md ".\src\%INPUT_DIR%"
)
echo          Done!

echo Coping new Sources
xcopy /E /Y /C /I /Q /H /R  %ORIGINAL_SOURCE%* ".\src\%INPUT_DIR%"

echo Cleaning .svn and .git folders
PUSHD .\
cd ".\src\%INPUT_DIR%"
for /d /r . %%d in (.svn) do @if exist "%%d" rd /s/q "%%d"
for /d /r . %%d in (.git) do @if exist "%%d" rd /s/q "%%d"
POPD

echo          Done!

echo JSDOC!

jsdoc -t templates/%TEMPLATE% -d ../doc/%OUTPUT_DIR% -r ./src/%INPUT_DIR% --verbose
echo          Done!