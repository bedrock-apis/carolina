param (
    [int]$ProcessID
)

# Variables to store cumulative values
$totalCPU = 0
$totalMemory = 0
$samples = 0

# Measure for 5 minutes (300 seconds)
$endTime = (Get-Date).AddMinutes(1)

while ((Get-Date) -lt $endTime) {
    # Get the process details
    $process = Get-Process -Id $ProcessID -ErrorAction SilentlyContinue

    if ($process) {
        # Add CPU and memory usage to totals
        $totalCPU += $process.CPU
        $totalMemory += $process.WorkingSet64 / 1MB
        $samples++
    } else {
        Write-Host "Process with ID '$ProcessID' not found or no longer running."
        break
    }

    # Wait for 1 second before the next sample
    Start-Sleep -Seconds 1
}

if ($samples -gt 0) {
    # Calculate averages
    $averageCPU = $totalCPU / $samples
    $averageMemory = $totalMemory / $samples

    # Display results
    Write-Host "Average CPU Usage (seconds): $averageCPU"
    Write-Host "Average Memory Usage (MB): $averageMemory"
} else {
    Write-Host "No data collected. Ensure the process with ID '$ProcessID' is running."
}
