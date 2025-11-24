import { NextRequest, NextResponse } from 'next/server';

// Helper to get authenticated user from request
// Verifies token by calling backend API
async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    // Verify token by calling backend /api/auth/me endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // CRITICAL: Authenticate user FIRST
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { userId, message } = body;

    // CRITICAL: Validate userId matches authenticated user
    // This prevents user impersonation
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Cannot access other user\'s data' },
        { status: 403 }
      );
    }

    // Now process the chat request safely
    // ... your chat logic here ...

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // CRITICAL: Authenticate user FIRST
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Get userId from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // CRITICAL: Validate userId matches authenticated user
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Cannot access other user\'s data' },
        { status: 403 }
      );
    }

    // Now fetch chat data safely
    // ... your chat logic here ...

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

