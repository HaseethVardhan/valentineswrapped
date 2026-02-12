
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Simulate environment
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    console.log('Testing createWrapped with integer start time...')
    
    const slug = `debug-${Date.now()}`
    
    // Test case 1: Integer start time (expected to work if schema is int)
    const payloadInt = {
        slug: slug + '-int',
        title: 'Debug Int',
        is_password_protected: false,
        bg_music_url: 'https://youtube.com/watch?v=123',
        bg_music_start_time: 120, // 2 minutes
        data: { pages: [] }
    }

    const { error: errorInt } = await supabase
        .from('wrappeds')
        .insert(payloadInt)
    
    if (errorInt) {
        console.error('Error with INT start time:', JSON.stringify(errorInt, null, 2))
    } else {
        console.log('Success with INT start time')
    }

    // Test case 2: String start time (simulating potential frontend issue)
    console.log('\nTesting createWrapped with string start time...')
     const payloadString = {
        slug: slug + '-str',
        title: 'Debug String', 
        is_password_protected: false,
        bg_music_url: 'https://youtube.com/watch?v=123',
        bg_music_start_time: "120", 
        data: { pages: [] }
    }

    // @ts-ignore
    const { error: errorString } = await supabase
        .from('wrappeds')
        .insert(payloadString)

    if (errorString) {
        console.error('Error with STRING start time:', JSON.stringify(errorString, null, 2))
    } else {
        console.log('Success with STRING start time')
    }
}

run()
