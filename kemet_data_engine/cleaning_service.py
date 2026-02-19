import re
import pandas as pd
from typing import Optional, Dict, Any

class DataCleaningService:
    @staticmethod
    def normalize_phone(phone: Any) -> Optional[str]:
        if not phone:
            return None
        
        # Convert to string and remove all non-numeric characters
        phone_str = str(phone)
        digits = "".join(filter(str.isdigit, phone_str))
        
        # Reject numbers longer than 14 digits (E.164 standard is 15, but for our system, anything > 14 digits is likely invalid)
        if len(digits) > 14:
            return None
            
        if not digits:
            return None
        
        cleaned = digits
        
        # Handle UAE Numbers
        # 05... (10 digits) -> 9715...
        if cleaned.startswith('05') and len(cleaned) == 10:
            cleaned = '971' + cleaned[1:]
        # 5... (9 digits) -> 9715...
        elif len(cleaned) == 9 and cleaned.startswith('5'):
            cleaned = '971' + cleaned
            
        # Hard validity check: 
        # UAE numbers (971) must be exactly 12 digits (+ +)
        if cleaned.startswith('971') and len(cleaned) != 12:
            return None
            
        # General international rule: minimum 10 digits total (e.g. +64... needs more than 7)
        if len(cleaned) < 10:
            return None
            
        # Check for obvious "fake" numbers (repeating digits or excessive zeros)
        if re.match(r'^(\d)\1+$', cleaned) or '0000000' in cleaned:
            return None
            
        return '+' + cleaned

    @staticmethod
    def validate_email(email: Any) -> Optional[str]:
        if not email:
            return None
            
        cleaned = str(email).strip().lower()
        
        # Simple email regex
        pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if re.match(pattern, cleaned):
            return cleaned
        return None

    @staticmethod
    def calculate_score(contact: Dict[str, Any]) -> int:
        score = 0
        name = contact.get("name", "Unknown")
        # Penalize Unknown names
        if name and name != "Unknown" and len(name) > 2: 
            score += 30
        else:
            score -= 20
            
        if contact.get("phone"): 
            score += 50
        else:
            score -= 30
            
        if contact.get("email"): 
            score += 40
            
        if contact.get("city"): 
            score += 10
            
        return max(0, min(100, score))

    @staticmethod
    def clean_contact(data: Dict[str, Any]) -> Dict[str, Any]:
        raw_name = str(data.get("name", "Unknown")).strip()
        # If name is empty or just "Unknown", treat as Unknown
        name = raw_name if raw_name and raw_name.lower() != "unknown" else "Unknown"
        
        raw_phone = str(data.get("phone", "")).strip()
        raw_email = str(data.get("email", "")).strip()
        
        cleaned: Dict[str, Any] = {
            "name": name,
            "phone": DataCleaningService.normalize_phone(raw_phone),
            "email": DataCleaningService.validate_email(raw_email),
            "raw_phone": raw_phone if raw_phone else None,
            "raw_email": raw_email if raw_email else None,
            "language": str(data.get("language", "English")).strip() if data.get("language") else "English",
            "city": str(data.get("city", "")).strip() if data.get("city") else None,
        }
        cleaned["score"] = DataCleaningService.calculate_score(cleaned)
        return cleaned

    @staticmethod
    def deduplicate(contacts: list) -> list:
        if not contacts:
            return []
        
        seen_phones = set()
        seen_emails = set()
        unique_contacts = []
        
        for c in contacts:
            phone = c.get("phone")
            email = c.get("email")
            
            is_dup = (phone and phone in seen_phones) or (email and email in seen_emails)
            
            if not is_dup:
                if phone: seen_phones.add(phone)
                if email: seen_emails.add(email)
                unique_contacts.append(c)
                
        return unique_contacts

    @staticmethod
    def clean_batch(contacts: list, do_deduplicate: bool = True) -> list:
        # We don't really use pandas yet, but keeping the import for future scaling.
        # If it's missing in the environment, we can remove it.
        # df = pd.DataFrame(contacts)
        
        cleaned_list = [DataCleaningService.clean_contact(c) for c in contacts]
        
        if do_deduplicate:
            cleaned_list = DataCleaningService.deduplicate(cleaned_list)
            
        return cleaned_list
