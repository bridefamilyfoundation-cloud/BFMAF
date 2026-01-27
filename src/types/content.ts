// Content Management Types
// Type definitions for dynamic content tables

export interface PageSection {
    id: string;
    page: string;
    section_key: string;
    content: string;
    created_at: string;
    updated_at: string;
    updated_by: string | null;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Value {
    id: string;
    title: string;
    description: string;
    icon: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface HowWeHelpItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProcessStep {
    id: string;
    step_number: number;
    title: string;
    description: string;
    icon: string;
    page: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SubmissionRequirement {
    id: string;
    title: string;
    description: string;
    icon: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
