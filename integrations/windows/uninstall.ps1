$ErrorActionPreference = 'Stop'
[Microsoft.Win32.Registry]::CurrentUser.DeleteSubKeyTree('Software\Classes\*\shell\convrt', $false)
