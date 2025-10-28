# Szybki przewodnik - Moduł płatności z walidacją cen

## Co się zmieniło?

✅ Każda wizyta ma teraz swoją cenę (pole `price`)  
✅ Płatności automatycznie obliczają sumę cen wybranych wizyt  
✅ System waliduje, czy kwota płatności pokrywa cenę wizyt  
✅ Ostrzeżenia przy wizytach bez ceny lub nadpłacie  

## Dla użytkowników

### Jak to działa teraz?

1. **Tworzysz wizytę** → Ustawiasz cenę (np. 150.00 PLN)
2. **Rejestrujesz płatność** → Wybierasz wizyty
3. **System automatycznie** → Oblicza sumę (np. 2 × 150 = 300 PLN)
4. **Zapisujesz** → Płatność jest powiązana z wizytami

### Przykład krok po kroku

```
1. Pacjent: Jan Kowalski
   
2. Wizyty do opłacenia:
   ☑ 15.01.2024  10:00-11:00  →  150.00 zł
   ☑ 18.01.2024  10:00-11:00  →  150.00 zł
   ─────────────────────────────────────────
   Suma cen:                    300.00 zł

3. Kwota płatności: 300.00 zł
   ✅ Kwota pokrywa cenę wizyt

4. [Zapisz płatność] ✓
```

## Walidacja kwoty

### ✅ Kwota OK (zapisze się bez pytań)
```
Wizyty: 300 PLN
Płatność: 300 PLN
→ Idealna kwota
```

### ℹ️ Mała nadpłata (zapisze się bez pytań)
```
Wizyty: 150 PLN
Płatność: 160 PLN
→ Nadpłata: 10 zł (6%)
```

### ⚠️ Duża nadpłata (system zapyta)
```
Wizyty: 150 PLN
Płatność: 200 PLN
→ Nadpłata: 50 zł (33%)
→ "Kwota jest znacznie wyższa. Kontynuować?"
```

### ❌ Za mało (NIE zapisze się)
```
Wizyty: 300 PLN
Płatność: 250 PLN
→ "Za mało o 50.00 zł"
→ Musisz zwiększyć kwotę
```

## Co jeśli wizyta nie ma ceny?

### Sytuacja:
```
Wizyty:
☑ 15.01.2024  →  150.00 zł
☑ 18.01.2024  →  Brak ceny ⚠️
```

### Zachowanie systemu:
1. Kwota ustawia się na 150 PLN (tylko pierwsza wizyta)
2. Pokazuje ostrzeżenie: "⚠️ 1 wizyta nie ma określonej ceny"
3. Musisz ręcznie ustalić pełną kwotę
4. Przy zapisie pojawi się pytanie potwierdzające

### Rozwiązanie:
**Najlepiej:** Edytuj wizytę i dodaj cenę przed płatnością
```
1. Przejdź do kalendarza wizyt
2. Kliknij wizytę bez ceny
3. Dodaj cenę (np. 150.00)
4. Zapisz
5. Teraz możesz zarejestrować płatność
```

## Praktyczne scenariusze

### Scenariusz 1: Standardowa płatność
```
✓ Pacjent ma 2 wizyty po 150 zł
✓ System ustawi kwotę na 300 zł
✓ Zapisz → Gotowe
```

### Scenariusz 2: Pacjent płaci więcej (zaliczka)
```
✓ Wizyty: 150 zł
✓ Pacjent daje: 200 zł
✓ System zapyta o potwierdzenie
✓ Potwierdź → Nadpłata 50 zł zarejestrowana
```

### Scenariusz 3: Różne ceny wizyt
```
✓ Wizyta indywidualna: 150 zł
✓ Wizyta grupowa: 100 zł
✓ System obliczy: 250 zł
✓ Zapisz → Gotowe
```

### Scenariusz 4: Stare wizyty bez ceny
```
✗ Wizyta z przeszłości: brak ceny
→ 1. Edytuj wizytę
→ 2. Dodaj cenę (np. 200 zł)
→ 3. Zapisz
→ 4. Teraz zarejestruj płatność
```

## Gdzie widzisz ceny?

### 📅 Kalendarz wizyt
```
10:00 - 11:00
Jan Kowalski
💰 150.00 zł  ← Cena wizyty
```

### 👤 Szczegóły pacjenta
```
Nadchodzące wizyty:
▸ 15.01.2024  10:00-11:00
  💰 150.00 zł
```

### 💳 Formularz płatności
```
Wizyty do opłacenia:
☑ 15.01.2024  10:00-11:00  →  150.00 zł
☑ 18.01.2024  10:00-11:00  →  150.00 zł
────────────────────────────────────────
Suma cen:                     300.00 zł
```

### 📄 Szczegóły płatności
```
Powiązane wizyty:
▸ 15.01.2024  10:00-11:00  💰 150.00 zł
▸ 18.01.2024  10:00-11:00  💰 150.00 zł
────────────────────────────────────────
Suma cen wizyt:     300.00 zł
Kwota płatności:    300.00 zł
```

## Najlepsze praktyki

### ✅ DOBRZE
1. Zawsze ustawiaj cenę przy tworzeniu wizyty
2. Jeśli zapomniałeś, dodaj ją przed płatnością
3. Sprawdź sumę przed zapisaniem płatności
4. Przy nadpłacie dodaj notatkę (np. "Zaliczka na luty")

### ❌ UNIKAJ
1. Pozostawiania wizyt bez ceny
2. Rejestrowania płatności bez sprawdzenia kwoty
3. Ignorowania ostrzeżeń systemu

## Rozwiązywanie problemów

### Problem: "Niektóre wizyty nie mają ceny"
**Rozwiązanie:**
```
1. Anuluj dodawanie płatności
2. Przejdź do kalendarza
3. Znajdź wizyty i dodaj ceny
4. Wróć do formularza płatności
5. Teraz będzie działać poprawnie
```

### Problem: "Kwota jest mniejsza niż suma cen wizyt"
**Rozwiązanie:**
```
1. Sprawdź sumę cen (wyświetlona pod listą wizyt)
2. Zwiększ kwotę płatności
3. Minimalna kwota = suma cen wizyt
```

### Problem: System pyta o nadpłatę
**To normalne gdy:**
```
✓ Pacjent płaci więcej (np. zaokrąglenie)
✓ Zaliczka na przyszłe wizyty
✓ Pakiet wizyt z rabatem

Jeśli to zamierzone → Potwierdź
Jeśli pomyłka → Anuluj i popraw kwotę
```

## Różnice z poprzednią wersją

### BYŁO (stara wersja):
```
❌ Wszystkie wizyty kosztowały 200 zł (sztywna cena)
❌ Brak walidacji kwoty
❌ Brak informacji o cenach w kalendarzu
```

### JEST (nowa wersja):
```
✅ Każda wizyta ma swoją cenę
✅ Automatyczne obliczanie sumy
✅ Walidacja przed zapisem
✅ Ceny widoczne wszędzie
✅ Ostrzeżenia o problemach
```

## Często zadawane pytania

**Q: Czy muszę ustawiać cenę dla każdej wizyty?**  
A: Zalecane, ale nie wymagane. System zadziała, ale z ostrzeżeniem.

**Q: Co jeśli zmienię cenę wizyty po dodaniu płatności?**  
A: Zmiana ceny wizyty NIE wpływa na już zarejestrowane płatności.

**Q: Mogę zapłacić więcej niż wynosi cena?**  
A: Tak! System zapyta o potwierdzenie przy dużej nadpłacie (>20%).

**Q: Co z wizytami z przeszłości bez ceny?**  
A: Możesz je edytować i dodać ceny. Dotyczy to również starych wizyt.

**Q: Gdzie jest rejestrowana nadpłata?**  
A: W szczegółach płatności widoczna jest różnica między kwotą a sumą cen.

## Podsumowanie

🎯 **Cel:** Każda wizyta ma swoją cenę, płatności są dokładne

📝 **Pamiętaj:** 
- Ustaw cenę przy tworzeniu wizyty
- Sprawdź sumę przed zapisaniem płatności
- Zwracaj uwagę na ostrzeżenia systemu

✨ **Korzyści:**
- Elastyczne ceny (różne typy wizyt)
- Automatyczne obliczenia (mniej błędów)
- Kontrola kwot (brak niedopłat)
- Przejrzystość finansowa

---

📚 **Więcej informacji:** `PAYMENTS_PRICE_VALIDATION.md`
