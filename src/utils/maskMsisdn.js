function maskMsisdn(msisdn) {
  const value = String(msisdn || '').replace(/\D/g, '');
  if (!value || value.length < 4) return '********';
  return `********${value.slice(-4)}`;
}

module.exports = maskMsisdn;
