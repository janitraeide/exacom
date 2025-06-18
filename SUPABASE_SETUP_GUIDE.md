# Supabase Backend Setup Guide for Job Applications

## Overview
This guide will help you set up the Supabase backend for your job application system. Your current Supabase credentials are already configured in the HTML file.

## Current Configuration
- **Supabase URL**: `https://hdqpffnjnlnswcghykxa.supabase.co`
- **Anon Key**: Already configured in your `careers.html` file

## Required Database Tables

### 1. Create `job_applications` Table

Go to your Supabase dashboard → SQL Editor and run this query:

```sql
-- Create job_applications table
CREATE TABLE job_applications (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    position VARCHAR(100) NOT NULL,
    job_id INTEGER NOT NULL,
    cover_letter TEXT NOT NULL,
    cv_url TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_job_applications_position ON job_applications(position);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_applied_at ON job_applications(applied_at);
```

### 2. Create Storage Bucket for CVs

1. Go to **Storage** in your Supabase dashboard
2. Click **Create Bucket**
3. Name it: `cvs`
4. Make it **Public** (so you can access uploaded files)
5. Click **Create Bucket**

### 3. Set Storage Policies

Go to **Storage** → **cvs** bucket → **Policies** and create these policies:

#### Policy 1: Allow Public Upload
```sql
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'cvs');
```

#### Policy 2: Allow Public Read
```sql
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'cvs');
```

## Row Level Security (RLS) Policies

### For job_applications table:

```sql
-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert applications
CREATE POLICY "Allow public insert" ON job_applications
FOR INSERT WITH CHECK (true);

-- Allow only authenticated users to read applications (for admin panel)
CREATE POLICY "Allow authenticated read" ON job_applications
FOR SELECT USING (auth.role() = 'authenticated');
```

## Job Positions Reference

The system includes these 10 job positions with their IDs:

1. **Accountants** (ID: 1)
2. **Office Boy** (ID: 2)
3. **Admin** (ID: 3)
4. **I.T Jobs** (ID: 4)
5. **Marketing Specialist** (ID: 5)
6. **Sales Executive** (ID: 6)
7. **Sales Manager** (ID: 7)
8. **Graphic Designer** (ID: 8)
9. **Tele Sales** (ID: 9)
10. **Security Guards** (ID: 10)

## Testing the Setup

1. Open your `careers.html` file in a browser
2. Click "Apply Now" on any job card
3. Fill out the application form
4. Submit the application
5. Check your Supabase dashboard → **Table Editor** → `job_applications` to see the submitted data
6. Check **Storage** → `cvs` to see the uploaded CV files

## Admin Panel (Optional)

To view applications, you can create a simple admin panel or use Supabase's built-in table editor.

### Quick Admin Query
Run this in SQL Editor to see all applications:

```sql
SELECT 
    id,
    full_name,
    email,
    phone,
    position,
    applied_at,
    status
FROM job_applications 
ORDER BY applied_at DESC;
```

## Troubleshooting

### Common Issues:

1. **File upload fails**: Check if `cvs` bucket exists and has public policies
2. **Application not saving**: Verify the `job_applications` table exists
3. **Permission denied**: Check RLS policies are correctly set

### Debug Steps:

1. Open browser Developer Tools (F12)
2. Check Console for error messages
3. Verify network requests in Network tab
4. Check Supabase logs in dashboard

## File Structure

Your current files:
- `careers.html` - Main careers page with job listings
- `css/style.css` - Updated with job card styles
- `js/careers-form.js` - Updated with modal and form handling
- `js/supabase-config.js` - Supabase configuration

## Next Steps

1. Set up the database table and storage as described above
2. Test the application form
3. Consider adding email notifications for new applications
4. Create an admin panel to manage applications

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase project settings
3. Ensure all policies are correctly configured
4. Test with a simple application first
