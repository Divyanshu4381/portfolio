import fs from 'fs'
import path from 'path'

export interface City {
    name: string
    state?: string
    country?: string
    category: string
    seoKeyword: string
    slug: string
}

function parseCSV(filename: string, parser: (parts: string[]) => City | null): City[] {
    try {
        const filePath = path.join(process.cwd(), 'app/seo/data', filename)
        if (!fs.existsSync(filePath)) return []

        const fileContent = fs.readFileSync(filePath, 'utf8')
        const lines = fileContent.split('\n')
        // Skip header and empty lines
        const dataLines = lines.slice(1).filter(line => line.trim() !== '')

        return dataLines.map(line => {
            const parts = line.split(',')
            if (parts.length < 1) return null
            return parser(parts)
        }).filter((item): item is City => item !== null)
    } catch (error) {
        console.error(`Error parsing ${filename}:`, error)
        return []
    }
}

export function getAllCities(): City[] {
    // Strategic Indian Cities (15)
    const topIndianCities = [
        'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
        'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Kanpur',
        'Lucknow', 'Noida', 'Gurgaon', 'Chandigarh', 'Indore'
    ]

    // Strategic US Cities (20) - for freelancing/remote work
    const topUSCities = [
        'San Francisco', 'New York City', 'Austin', 'Seattle', 'Boston',
        'Los Angeles', 'Chicago', 'Denver', 'Miami', 'Atlanta',
        'San Jose', 'Dallas', 'Houston', 'Phoenix', 'Philadelphia',
        'San Diego', 'Portland', 'Salt Lake City', 'Raleigh'
    ]

    // Parse Indian Cities
    const indiaCities = parseCSV('india_cities.csv', (parts) => {
        if (parts.length < 2) return null
        const name = parts[0].trim()

        // Only include strategic cities
        if (!topIndianCities.includes(name)) return null

        return {
            name,
            state: parts[1]?.trim(),
            country: 'India',
            category: 'India City',
            seoKeyword: `Web Developer in ${name}`,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
        }
    })

    // Parse US Cities
    const usCities = parseCSV('us_cities_data.csv', (parts) => {
        if (parts.length < 2) return null
        const name = parts[0].trim()

        // Only include strategic cities
        if (!topUSCities.includes(name)) return null

        return {
            name,
            state: parts[1]?.trim(),
            country: 'United States',
            category: parts[2]?.trim() || 'US City',
            seoKeyword: `Remote Web Developer for ${name}`,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
        }
    })

    // Combine: India first, then US
    return [...indiaCities, ...usCities]
}

// Helper function to get only Indian cities
export function getIndianCities(): City[] {
    return getAllCities().filter(city => city.country === 'India')
}

// Helper function to get only US cities
export function getUSCities(): City[] {
    return getAllCities().filter(city => city.country === 'United States')
}
