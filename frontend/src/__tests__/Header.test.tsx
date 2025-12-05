import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../components/Header'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({ push: vi.fn() }),
}))

// Mock auth store
const mockLogout = vi.fn()
const mockFetchCurrentUser = vi.fn()

vi.mock('@/store/authStore', () => ({
    useAuthStore: vi.fn(() => ({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
        fetchCurrentUser: mockFetchCurrentUser,
    })),
}))

import { useAuthStore } from '@/store/authStore'

describe('Header', () => {
    it('renders Heka logo', () => {
        render(<Header />)
        expect(screen.getByText('Heka')).toBeInTheDocument()
    })

    it('renders public links when not authenticated', () => {
        render(<Header />)
        expect(screen.getByText('Pricing')).toBeInTheDocument()
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('renders authenticated links when user is logged in', () => {
        // Override mock for this test
        vi.mocked(useAuthStore).mockImplementation(() => ({
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            isAuthenticated: true,
            logout: mockLogout,
            fetchCurrentUser: mockFetchCurrentUser,
        }))

        render(<Header />)
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Logout')).toBeInTheDocument()
    })
})
