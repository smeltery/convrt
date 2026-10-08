window.showConversionResult = ({ results, errors }) => {
  const status = document.getElementById('status')
  const failed = errors.length > 0
  const succeeded = results.length > 0
  status.dataset.state = failed ? 'error' : 'success'
  const title = failed
    ? succeeded
      ? `${results.length} converted · ${errors.length} failed`
      : 'Conversion failed'
    : succeeded
      ? `${results.length} ${results.length === 1 ? 'file' : 'files'} converted`
      : 'No files converted'
  status.textContent = [
    title,
    ...results.map((item) => `Saved ${item.output}`),
    ...errors.map((item) => item.message),
    ...(failed
      ? [
          'Review the error, adjust your settings or selection, then convert again.',
        ]
      : []),
  ].join('\n')
  status.scrollIntoView({ block: 'nearest' })
  if (failed) window.stopCelebration?.()
  else if (succeeded) window.celebrateConversion()
}
