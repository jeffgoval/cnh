export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'ALUNO' | 'INSTRUTOR' | 'ADMIN'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type Categoria = 'ACC' | 'A' | 'B'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  bio: string | null
  document_verified: boolean
  cpf: string | null
  renach_instrutor: string | null
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface InstructorAsset {
  id: string
  instructor_id: string
  vehicle_model: string | null
  license_plate: string | null
  categoria: Categoria | null
  cnh_photo_url: string | null
  credential_photo_url: string | null
  verification_status: VerificationStatus
  created_at: string
  updated_at: string
}

export interface Slot {
  id: string
  instructor_id: string
  start_time: string
  end_time: string
  is_booked: boolean
  price: number
  location_address: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  slot_id: string
  student_id: string
  instructor_id: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & { id: string }
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      instructor_assets: {
        Row: InstructorAsset
        Insert: Omit<InstructorAsset, 'id' | 'created_at' | 'updated_at' | 'verification_status'> & {
          id?: string
          verification_status?: VerificationStatus
        }
        Update: Partial<Omit<InstructorAsset, 'id' | 'created_at' | 'updated_at'>>
      }
      slots: {
        Row: Slot
        Insert: Omit<Slot, 'id' | 'created_at' | 'updated_at' | 'is_booked'> & {
          id?: string
          is_booked?: boolean
        }
        Update: Partial<Omit<Slot, 'id' | 'created_at' | 'updated_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'status'> & {
          id?: string
          status?: AppointmentStatus
        }
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}



