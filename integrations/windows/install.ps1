param([Parameter(Mandatory=$true)][string]$Executable)
$ErrorActionPreference = 'Stop'
$Resolved = (Resolve-Path -LiteralPath $Executable).Path
if (-not $Resolved.EndsWith('.exe') -or $Resolved.Contains('"')) {
    throw 'Provide the path to the installed convrt desktop executable.'
}
# Registry APIs keep the file-class asterisk literal, without wildcard expansion.
$Key = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey('Software\Classes\*\shell\convrt')
try {
    $Key.SetValue('', 'Convert with convrt')
    $Key.SetValue('Icon', $Resolved)
    $Key.SetValue('MultiSelectModel', 'Player')
    $Command = $Key.CreateSubKey('command')
    try { $Command.SetValue('', ('"' + $Resolved + '" "%1"')) }
    finally { $Command.Dispose() }
} finally { $Key.Dispose() }
Write-Output 'Installed per-user Explorer menu. On Windows 11, use Show more options.'
