"""Input sanitization utilities to prevent NoSQL injection and XSS attacks."""

import re
from typing import Optional


def sanitize_text(text: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize user input text to prevent NoSQL injection and XSS.
    
    Args:
        text: Input text to sanitize
        max_length: Optional maximum length
    
    Returns:
        Sanitized text
    
    Raises:
        ValueError: If text contains suspicious patterns or exceeds max_length
    """
    if not isinstance(text, str):
        raise ValueError("Input must be a string")
    
    # Remove null bytes (NoSQL injection)
    text = text.replace('\x00', '')
    
    # Remove suspicious NoSQL injection patterns
    # Check for excessive special characters that might be used in MongoDB queries
    dollar_count = text.count('$')
    brace_count = text.count('{')
    paren_count = text.count('(')
    
    if dollar_count > 5:
        raise ValueError("Content contains suspicious patterns (too many '$' characters)")
    if brace_count > 10:
        raise ValueError("Content contains suspicious patterns (too many '{' characters)")
    if paren_count > 20:
        raise ValueError("Content contains suspicious patterns (too many '(' characters)")
    
    # Check for MongoDB operator patterns
    dangerous_patterns = [
        r'\$where',
        r'\$regex',
        r'\$code',
        r'\$eval',
        r'javascript:',
        r'on\w+\s*=',
    ]
    
    text_lower = text.lower()
    for pattern in dangerous_patterns:
        if re.search(pattern, text_lower):
            raise ValueError(f"Content contains potentially dangerous pattern: {pattern}")
    
    # Trim whitespace
    text = text.strip()
    
    # Check length
    if max_length and len(text) > max_length:
        raise ValueError(f"Content exceeds maximum length of {max_length} characters")
    
    return text


def validate_object_id(object_id: str) -> str:
    """
    Validate and sanitize MongoDB ObjectId string.
    
    Args:
        object_id: ObjectId string to validate
    
    Returns:
        Validated ObjectId string
    
    Raises:
        ValueError: If ObjectId is invalid
    """
    from bson import ObjectId
    
    if not isinstance(object_id, str):
        raise ValueError("ObjectId must be a string")
    
    # Remove any whitespace
    object_id = object_id.strip()
    
    # Check length (ObjectId is 24 hex characters)
    if len(object_id) != 24:
        raise ValueError(f"Invalid ObjectId length: {len(object_id)} (expected 24)")
    
    # Check if it's valid hex
    try:
        # This will raise ValueError if invalid
        ObjectId(object_id)
    except Exception as e:
        raise ValueError(f"Invalid ObjectId format: {str(e)}")
    
    return object_id


def sanitize_email(email: str) -> str:
    """
    Sanitize email address.
    
    Args:
        email: Email address to sanitize
    
    Returns:
        Sanitized email address
    
    Raises:
        ValueError: If email format is invalid
    """
    from email_validator import validate_email, EmailNotValidError
    
    # Basic sanitization
    email = email.strip().lower()
    
    # Remove null bytes
    email = email.replace('\x00', '')
    
    # Validate email format using email-validator
    try:
        # Validate email format
        validation_result = validate_email(email, check_deliverability=False)
        return validation_result.email
    except EmailNotValidError as e:
        raise ValueError(f"Invalid email format: {str(e)}")


