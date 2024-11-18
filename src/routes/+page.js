import POIS from '$lib/data/pois.json';

export const prerender = true;

export const load = async () => {
  const transformedPois = POIS.features.reduce((acc, feature) => {
    const { name, date, url } = feature.properties;

    if (!acc[name]) {
      acc[name] = {
        links: {},
        coordinates: feature.geometry.coordinates,
        neighborhood: feature.properties.neighbourhood
      };
    }

    if (!acc[name].links[date]) {
      acc[name].links[date] = [];
    }

    acc[name].links[date].push(url);
    return acc;
  }, {});

  return {
    pois: transformedPois
  };
};
