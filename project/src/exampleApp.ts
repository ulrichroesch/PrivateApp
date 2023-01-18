import axios from 'axios';
import _ from 'lodash';
import FileSync from 'lowdb/adapters/FileSync';
import { v4 } from 'uuid';
import { APPLICATION_CONFIG } from './config';
import logger from './logger';
import { ICustomFieldInput, IErrorInput, IFetchInput, IInstallInput, ISendInput, IUpdateInput, IVariableTimeSeries, IFlatTimeSeries, LocationsRoute, Waypoint } from './types';

const startingLocation = {
  address: 'State de France, 93200 Saint-Denis',
  latitude: 48.92458606867835,
  longitude: 2.3601430411763062,
};

// tslint:disable-next-line: no-var-requires
const lowdb = require('lowdb');

const adapter = new FileSync(process.env.LOCAL_DATABASE_PATH || 'db.json');
const db = lowdb(adapter);

// Insert some details about the tanks in the database. This is to simulate a customer database containing private data about the tanks.
// Some info like accessCode and contact point can be useful to refill the tanks.
db.defaults({
  apps: [], tanks: [{
    reference: 'RUS',
    name: 'St. Petersburg - Kretowski Stadium',
    location: {
      address: 'Futbol\'naya Alleya, 1, St Petersburg, Russie, 197110',
      latitude: 59.972832674101525,
      longitude: 30.221415227517177,
    },
    threshold: 15,
    accessCode: 1234,
    contact: 'Annot Rouze, 05.84.68.91.62'
  }, {
    reference: 'AZE',
    name: 'Baku - National Stadium',
    location: {
      address: 'Heydar Aliyev, 323, Baku, Azerbaïdjan',
      latitude: 40.430121314819544,
      longitude: 49.91964491405265,
    },
    threshold: 15,
    accessCode: 2345,
    contact: 'Odo De La Ronde, 04.52.51.64.80'
  }, {
    reference: 'ITA',
    name: 'Rome - Olympic Stadium',
    location: {
      address: 'Viale dei Gladiatori, 00135 Roma RM, Italie',
      latitude: 41.93425256831585,
      longitude: 12.454832287092637,
    },
    threshold: 15,
    accessCode: 3456,
    contact: 'Ambra Auberjonois, 01.28.77.55.64'
  }, {
    reference: 'DEU',
    name: 'Munich - Allianz Arena',
    location: {
      address: 'Werner-Heisenberg-Allee 25, 80939 München, Allemagne',
      latitude: 48.21892124594104,
      longitude: 11.62479841418075,
    },
    threshold: 15,
    accessCode: 4567,
    contact: 'Maurelle Quiron, 02.28.89.06.61'
  }, {
    reference: 'GBR',
    name: 'London-Wembley Stadium',
    location: {
      address: 'London HA9 0WS, Royaume-Uni',
      latitude: 51.556204786675295,
      longitude: -0.2795855145936859,
    },
    threshold: 15,
    accessCode: 5678,
    contact: 'Sébastien Pellerin, 01.77.54.91.18'
  }]
}).write();

const ensureAppExists = (assetId: string) => {
  const app = db
    .get('apps')
    .find({ id: assetId })
    .value();
  if (!app) {
    throw new Error(`App ${assetId} doesn't exists`);
  }
  return app;
};

const validateRequiredParameters = (customUserFields: ICustomFieldInput[]) => {
  const requiredParams = ['reference'];
  const hasAllRequiredParams = requiredParams.every(param =>
    customUserFields.some(customField => customField.key === param && customField.value !== ''),
  );
  if (!hasAllRequiredParams) {
    throw new Error('Missing required parameters');
  }
};

export const configExampleApp = () => {
  return APPLICATION_CONFIG;
};

export const installExampleApp = (body: IInstallInput): string => {
  validateRequiredParameters(body.customUserFields);
  const assetId = v4();
  db.get('apps')
    .push({
      id: assetId,
      name: body.name,
      selectedVariables: body.selectedVariables,
      customUserFields: body.customUserFields,
    })
    .write();
  return assetId;
};

export const updateExampleApp = (assetId: string, body: IUpdateInput): void => {
  ensureAppExists(assetId);
  validateRequiredParameters(body.customUserFields);
  db.get('apps')
    .find({ id: assetId })
    .assign({
      name: body.name,
      selectedVariables: body.selectedVariables,
      customUserFields: body.customUserFields,
    })
    .write();
};

export const uninstallExampleApp = (assetId: string): void => {
  ensureAppExists(assetId);
  db.get('apps')
    .remove({ id: assetId })
    .write();
};

export const sendExampleApp = (assetId: string, body: ISendInput): IVariableTimeSeries[] => {
  ensureAppExists(assetId);

  if (body.variablesTimeSeries.length > 0) {
    const flatVariablesTimeSeries: IFlatTimeSeries[] = [];
    body.variablesTimeSeries.forEach(variableTimeSeries => {
      variableTimeSeries.timeSeries.forEach(timeSerie => {
        flatVariablesTimeSeries.push({
          variable: variableTimeSeries.variable,
          timestamp: timeSerie.timestamp,
          value: timeSerie.value,
        });
      });
    });
    const groupedTimeSeries = _(flatVariablesTimeSeries)
      .groupBy('timestamp')
      .map((groupedVariables, timestamp) => {
        const vars: { [key: string]: number } = {};
        vars.timestamp = groupedVariables[0].timestamp;
        groupedVariables.forEach(variable => {
          vars[variable.variable] = variable.value;
        });
        return vars;
      })
      .orderBy('timestamp', 'desc')
      .value();
    const lastValues = groupedTimeSeries[0];
    // Take only the most recent value and store it on the app level
    if (lastValues) {
      db.get('apps')
        .find({ id: assetId })
        .assign({
          lastValues
        })
        .write();
    }
  }

  return [];
};

export const fetchExampleApp = async (assetId: string, body: IFetchInput): Promise<IVariableTimeSeries[]> => {
  throw new Error('Not implemented');
};

export const locationsExampleApp = async (): Promise<any[]> => {
  // To get the location list, we first iterate over each installed app.
  // Then we search for the associated tank (based on the reference) in order to get the threshold
  // We then check the level of each tank per location to see if at least one is below the threshold
  // If there is at least one tank that need to be refilled, we add the location of the tank in the list of locations to be refilled
  const locationNeedingRefill: any[] = [];
  const apps = db
    .get('apps')
    .value();

  apps.forEach((app: any) => {
    if (app.lastValues) {
      const reference = app.customUserFields.find((userField: any) => userField.key === 'reference');
      const tank = db
        .get('tanks')
        .find({ reference: reference.value })
        .value();
      if (tank) {
        const tankNeedingRefill = [];

        for (const [key, value] of Object.entries(app.lastValues)) {
          if (key !== 'timestamp') {
            if (value as number < tank.threshold) {
              tankNeedingRefill.push(key);
            }
          }
        }
        if (tankNeedingRefill.length > 0) {
          locationNeedingRefill.push({
            reference: tank.reference,
            name: tank.name,
            location: tank.location,
            accessCode: tank.accessCode,
            refillTanks: tankNeedingRefill.map(t => t.replace('Level:', '')).join(', ')
          })
        }
      }
    }
  });
  return locationNeedingRefill;
};

export const routeExampleApp = async (): Promise<LocationsRoute> => {
  const locations = await locationsExampleApp();
  const apiJson = {
    vehicles: [
      {
        vehicle_id: "my_vehicle",
        start_address: {
          location_id: startingLocation.address,
          lon: startingLocation.longitude,
          lat: startingLocation.latitude
        }
      }
    ],
    services: [] as any
  };

  locations.forEach(location => {
    apiJson.services.push({
      id: location.reference,
      name: location.name,
      address: {
        location_id: location.name,
        lon: location.location.longitude,
        lat: location.location.latitude
      }
    });
  });

  try {
    const bestRoute = await axios.post('https://graphhopper.com/api/1/vrp?key=099b450d-d4da-4428-b9c0-da20b1d4fc60', apiJson, { proxy: false });
    const activities = bestRoute.data.solution.routes[0].activities;
    let startingLocation: Waypoint = {};
    let endingLocation: Waypoint = {};
    const waypoints: Waypoint[] = [];
    activities.forEach((activity: any) => {
      if (activity.type === 'start') {
        startingLocation = {
          location: {
            address: activity.address.location_id,
            lat: activity.address.lat,
            lng: activity.address.lon
          }
        }
      } else if (activity.type === 'end') {
        endingLocation = {
          location: {
            address: activity.address.location_id,
            lat: activity.address.lat,
            lng: activity.address.lon
          }
        }
      } else {
        waypoints.push({
          location: {
            address: activity.address.location_id,
            lat: activity.address.lat,
            lng: activity.address.lon
          }
        });
      }
    });
    return {
      startingLocation,
      waypoints,
      endingLocation,
    };
  } catch (error) {
    console.log('error when getting best route', error.message);
    throw new Error(JSON.stringify(error.response.data));
  }
};

export const errorExampleApp = (body: IErrorInput): void => {
  logger.info(`Error : ${body.errorMessage} - ${body.assetId} - ${body.endpoint}`);
};
