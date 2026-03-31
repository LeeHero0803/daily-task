$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process -FilePath "$dir\_run_backend.bat" -WindowStyle Hidden
Start-Process -FilePath "$dir\_run_frontend.bat" -WindowStyle Hidden
