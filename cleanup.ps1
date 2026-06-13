$lines = [System.IO.File]::ReadAllLines("c:\My\portfolio\index.html")
# Find the line with .mag-rail-scroll { (the first real CSS after the orphan block)
$magRailLine = -1
for ($i = 3167; $i -lt $lines.Count; $i++) {
    if ($lines[$i].Trim() -eq ".mag-rail-scroll {") {
        $magRailLine = $i
        break
    }
}

if ($magRailLine -gt 0) {
    # Keep lines 0..3167 (up to the closing brace of our new CSS)
    # Then skip to magRailLine
    $before = $lines[0..3167]
    $after = $lines[$magRailLine..($lines.Count - 1)]
    $result = $before + "" + $after
    [System.IO.File]::WriteAllLines("c:\My\portfolio\index.html", $result)
    Write-Host "Done. Removed lines 3169 to $magRailLine. New total: $($result.Count)"
} else {
    Write-Host "Could not find .mag-rail-scroll"
}
