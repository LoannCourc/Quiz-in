// Configuration d'Expo : app.json, inchangé pour tous les profils. Seule exception, facultative : CAST_RECEIVER_APP_ID
// (profil EAS preview-essai-tv) remplace le récepteur Cast, pour tester la TV d'essai sans toucher à la production.
module.exports = ({ config }) => {
  const receiverAppId = process.env.CAST_RECEIVER_APP_ID;
  if (!receiverAppId) return config;
  const plugins = config.plugins.map((plugin) =>
    Array.isArray(plugin) && plugin[0] === 'react-native-google-cast' ? [plugin[0], { ...plugin[1], receiverAppId }] : plugin,
  );
  return { ...config, plugins };
};
