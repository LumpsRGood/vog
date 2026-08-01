export interface StoreLocation {
  storeNumber: string;
  address: string;
  city: string;
  state: string;
  stateName: string;
  zip: string;
}

export const STORE_LOCATIONS: StoreLocation[] = [
  // GA
  { storeNumber: '2044', address: '4361 Washington Rd', city: 'Evans', state: 'GA', stateName: 'Georgia', zip: '30809' },
  { storeNumber: '2061', address: '2510 Flat shoals Rd', city: 'Atlanta', state: 'GA', stateName: 'Georgia', zip: '30349' },
  { storeNumber: '2090', address: '2390 Dallas Hwy', city: 'Marietta', state: 'GA', stateName: 'Georgia', zip: '30064' },
  { storeNumber: '3143', address: '3463-B Lawrenceville Suwanee Rd', city: 'Suwanee', state: 'GA', stateName: 'Georgia', zip: '30024' },
  { storeNumber: '3187', address: '4018 Lawrenceville Highway NW', city: 'Lilburn', state: 'GA', stateName: 'Georgia', zip: '30047' },
  { storeNumber: '3577', address: '520 Carl Bethlehem Rd, Ste 200', city: 'Bethlehem', state: 'GA', stateName: 'Georgia', zip: '30620' },
  { storeNumber: '3762', address: '1129 HWY 92 Acworth', city: 'Acworth', state: 'GA', stateName: 'Georgia', zip: '30102' },
  { storeNumber: '3769', address: '167 Steven B Tanger Blvd', city: 'Commerce', state: 'GA', stateName: 'Georgia', zip: '30529' },
  { storeNumber: '3843', address: '2520 delk rd se', city: 'Marietta', state: 'GA', stateName: 'Georgia', zip: '30067' },
  { storeNumber: '3855', address: '5783 Old Winder Hwy', city: 'Braselton', state: 'GA', stateName: 'Georgia', zip: '30517' },
  { storeNumber: '406', address: '6120 Roswell Rd', city: 'Sandy Springs', state: 'GA', stateName: 'Georgia', zip: '30328' },
  { storeNumber: '409', address: '5000 Jimmy Carter Blvd', city: 'Norcross', state: 'GA', stateName: 'Georgia', zip: '30093' },
  { storeNumber: '413', address: '2741 Clairmont Rd', city: 'Atlanta', state: 'GA', stateName: 'Georgia', zip: '30329' },
  { storeNumber: '426', address: '179 Cobb Pkwy S.', city: 'Marietta', state: 'GA', stateName: 'Georgia', zip: '30060' },
  { storeNumber: '4410', address: '955 Lawrenceville Suwanee Rd', city: 'Lawrenceville', state: 'GA', stateName: 'Georgia', zip: '30043' },
  { storeNumber: '4428', address: '7401 Douglas Blvd', city: 'Douglasville', state: 'GA', stateName: 'Georgia', zip: '30135' },
  { storeNumber: '4444', address: '5170 Memorial Drive', city: 'Stone Mountain', state: 'GA', stateName: 'Georgia', zip: '30083' },
  { storeNumber: '4449', address: '61 Depot Drive', city: 'Hiram', state: 'GA', stateName: 'Georgia', zip: '30141' },
  { storeNumber: '4452', address: '6125 Peachtree Parkway', city: 'Norcross', state: 'GA', stateName: 'Georgia', zip: '30092' },
  { storeNumber: '4460', address: '35 Riverbend Drive', city: 'Rome', state: 'GA', stateName: 'Georgia', zip: '30161' },
  { storeNumber: '4493', address: '11720 Medlock Bridge Rd', city: 'Duluth', state: 'GA', stateName: 'Georgia', zip: '30097' },
  { storeNumber: '457', address: '10686 Alpharetta Highway', city: 'Roswell', state: 'GA', stateName: 'Georgia', zip: '30076' },
  { storeNumber: '473', address: '970 Thorton Rd', city: 'Lithia Springs', state: 'GA', stateName: 'Georgia', zip: '30122' },
  { storeNumber: '480', address: '3675 Hwy 138 E', city: 'Stockbridge', state: 'GA', stateName: 'Georgia', zip: '30281' },
  { storeNumber: '490', address: '742 Hwy 53 SE', city: 'Calhoun', state: 'GA', stateName: 'Georgia', zip: '30701' },
  { storeNumber: '5643', address: '122 Truck Stop Way', city: 'Jackson', state: 'GA', stateName: 'Georgia', zip: '30233' },
  { storeNumber: '5666', address: '981 Cassville-White Rd', city: 'Cartersville', state: 'GA', stateName: 'Georgia', zip: '30121' },
  // OH/IN/MI
  { storeNumber: '3775', address: '6550 E. Lloyd Expy', city: 'Evansville', state: 'IN', stateName: 'Indiana', zip: '47715' },
  { storeNumber: '5430', address: '3289 Elida Rd', city: 'Lima', state: 'OH', stateName: 'Ohio', zip: '45805' },
  { storeNumber: '5450', address: '10151 Fremont Pike', city: 'Perrysburg', state: 'OH', stateName: 'Ohio', zip: '43551' },
  { storeNumber: '5456', address: '4045 Talmadge Rd', city: 'Toledo', state: 'OH', stateName: 'Ohio', zip: '43623' },
  { storeNumber: '5461', address: '6535 Airport Hwy', city: 'Holland', state: 'OH', stateName: 'Ohio', zip: '43528' },
  { storeNumber: '5601', address: '21055 West Rd', city: 'Woodhaven', state: 'MI', stateName: 'Michigan', zip: '48183' },
  // PA
  { storeNumber: '3223', address: '1002 Sutherland Dr', city: 'Pittsburgh', state: 'PA', stateName: 'Pennsylvania', zip: '15205' },
  { storeNumber: '3236', address: '702 Walmart Dr', city: 'Uniontown', state: 'PA', stateName: 'Pennsylvania', zip: '15401' },
  { storeNumber: '3238', address: '4656 Browns Hill Rd', city: 'Pittsburgh', state: 'PA', stateName: 'Pennsylvania', zip: '15217' },
  { storeNumber: '3402', address: '5159 State Route 30 E', city: 'Greensburg', state: 'PA', stateName: 'Pennsylvania', zip: '15601' },
  // VA
  { storeNumber: '2067', address: '5518 George Washington Memorial Hwy', city: 'Yorktown', state: 'VA', stateName: 'Virginia', zip: '23692' },
  { storeNumber: '3475', address: '4401 Virginia Beach Blvd', city: 'Virginia Beach', state: 'VA', stateName: 'Virginia', zip: '23462-3106' },
  { storeNumber: '4424', address: '817 First Colonial Rd', city: 'Virginia Beach', state: 'VA', stateName: 'Virginia', zip: '23451' },
  { storeNumber: '487', address: '11745 Jefferson Ave STE 1', city: 'Newport News', state: 'VA', stateName: 'Virginia', zip: '23606' },
  { storeNumber: '520', address: '1002 W Mercury Blvd', city: 'Hampton', state: 'VA', stateName: 'Virginia', zip: '23666-3405' },
  { storeNumber: '5634', address: '2516 N Lee Hwy', city: 'Lexington', state: 'VA', stateName: 'Virginia', zip: '24450' },
  { storeNumber: '573', address: '3926 Franklin Rd SW', city: 'Roanoke', state: 'VA', stateName: 'Virginia', zip: '24014-3055' },
  { storeNumber: '577', address: '114 E 21st St', city: 'Norfolk', state: 'VA', stateName: 'Virginia', zip: '23517-2315' },
  // NC&SC
  { storeNumber: '2008', address: '229 Airport Rd', city: 'Arden', state: 'NC', stateName: 'North Carolina', zip: '28704' },
  { storeNumber: '3124', address: '245 Tunnel Rd', city: 'Asheville', state: 'NC', stateName: 'North Carolina', zip: '28805' },
  { storeNumber: '3452', address: '1494-A West Wade Hampton Blvd', city: 'Greer', state: 'SC', stateName: 'South Carolina', zip: '29650-1166' },
  { storeNumber: '3512', address: '1609 Westover Terrace', city: 'Greensboro', state: 'NC', stateName: 'North Carolina', zip: '27408-7105' },
  { storeNumber: '3589', address: '2095 East Main St', city: 'Spartanburg', state: 'SC', stateName: 'South Carolina', zip: '29307-1430' },
  { storeNumber: '4407', address: '110 E Parris Ave', city: 'High Point', state: 'NC', stateName: 'North Carolina', zip: '27262' },
  { storeNumber: '4415', address: '3010 S Evans Street', city: 'Greenville', state: 'NC', stateName: 'North Carolina', zip: '27834-6939' },
  { storeNumber: '4423', address: '105 Faith Rd', city: 'Salisbury', state: 'NC', stateName: 'North Carolina', zip: '28146' },
  { storeNumber: '4438', address: '3400 M. L. King, Jr. Blvd', city: 'New Bern', state: 'NC', stateName: 'North Carolina', zip: '28562-5220' },
  { storeNumber: '491', address: '1101 Lanada Rd', city: 'Greensboro', state: 'NC', stateName: 'North Carolina', zip: '27407' },
  { storeNumber: '5656', address: '500 Buckhorn Rd', city: 'Mebane', state: 'NC', stateName: 'North Carolina', zip: '27302' },
  // AL
  { storeNumber: '3231', address: '2729 Legends Pkwy', city: 'Prattville', state: 'AL', stateName: 'Alabama', zip: '36067' },
  { storeNumber: '4445', address: '115 Eastern Boulevard', city: 'Montgomery', state: 'AL', stateName: 'Alabama', zip: '36117-2007' },
  { storeNumber: '4456', address: '1904 US Highway 78 E', city: 'Oxford', state: 'AL', stateName: 'Alabama', zip: '36203' },
  { storeNumber: '4463', address: '1428 Beltline Road Sw', city: 'Decatur', state: 'AL', stateName: 'Alabama', zip: '35601-5504' },
];

export const STATES = Array.from(new Set(STORE_LOCATIONS.map(loc => loc.state))).sort();

export const STATE_OPTIONS = STATES.map(state => {
  const location = STORE_LOCATIONS.find(loc => loc.state === state);
  return {
    code: state,
    name: location?.stateName ?? state
  };
}).sort((a, b) => a.name.localeCompare(b.name));
