// Philippine Provinces, Cities, and Barangays
// Using complete data from philippine_provinces_cities_municipalities_and_barangays.json

import locationData from './philippine_provinces_cities_municipalities_and_barangays.json'

export interface Location {
  name: string
  cities?: City[]
}

export interface City {
  name: string
  barangays?: string[]
}

// Transform JSON data to our format
// JSON structure: regions -> provinces -> municipalities -> barangays
export const philippineProvinces: Location[] = Object.values(locationData as any)
  .flatMap((region: any) => 
    Object.entries(region.province_list || {}).map(([provinceName, provinceData]: [string, any]) => ({
      name: provinceName,
      cities: Object.entries(provinceData.municipality_list || {}).map(([cityName, cityData]: [string, any]) => ({
        name: cityName,
        barangays: cityData.barangay_list || []
      }))
    }))
  )
  .sort((a, b) => a.name.localeCompare(b.name))

// Helper function to get cities by province
export function getCitiesByProvince(provinceName: string): City[] {
  const province = philippineProvinces.find(p => p.name === provinceName)
  return province?.cities || []
}

// Helper function to get barangays by city
export function getBarangaysByCity(provinceName: string, cityName: string): string[] {
  const province = philippineProvinces.find(p => p.name === provinceName)
  const city = province?.cities?.find(c => c.name === cityName)
  return city?.barangays || []
}
