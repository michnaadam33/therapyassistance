# Moduł płatności - walidacja cen wizyt

Data aktualizacji: 2024-01-15

## Przegląd zmian

Zaktualizowano moduł płatności, aby uwzględniał indywidualne ceny wizyt i walidował, czy kwota płatności pokrywa cenę wybranych wizyt.

**ZAŁOŻENIE:** Każda wizyta posiada określoną cenę. Pole `price` jest wymagane przy tworzeniu wizyty.

## Zmiany w Backend (FastAPI)

### Walidacja w `create_payment` (`backend/app/routers/payments.py`)

Dodano automatyczną walidację kwoty płatności:

1. **Obliczanie sumy cen wizyt**
   - System sumuje ceny wszystkich wybranych wizyt
   - Każda wizyta ma określoną cenę (pole wymagane)

2. **Walidacja minimalnej kwoty**
   - Kwota płatności musi być >= suma cen wizyt
   - W przeciwnym razie zwracany jest błąd 400 z komunikatem

3. **Ostrzeżenie o nadpłacie**
   - Jeśli kwota > 120% sumy cen wizyt, logowane jest ostrzeżenie
   - Płatność jest akceptowana, ale ostrzeżenie trafia do logów

### Walidacja w `update_payment`

Podobna walidacja jak w `create_payment`, uwzględniająca:
- Nową kwotę (jeśli jest aktualizowana)
- Nowe wizyty (jeśli są zmieniane)
- Istniejącą kwotę (jeśli nie jest zmieniana)

### Komunikaty błędów

```python
# Przykład błędu walidacji
{
  "detail": "Kwota płatności (150.00 PLN) jest mniejsza niż suma cen wybranych wizyt (300.00 PLN)"
}
```

## Zmiany w Frontend (React/TypeScript)

### PaymentForm.tsx - Główne zmiany

#### 1. Automatyczne obliczanie kwoty

```typescript
// Suma cen wybranych wizyt (każda wizyta ma cenę)
const totalAmount = selectedAppointments.reduce(
  (sum, apt) => sum + (apt.price || 0),
  0,
);
```

- Kwota jest automatycznie ustawiana na sumę cen wybranych wizyt
- Każda wizyta ma określoną cenę
- Użytkownik może ręcznie zmienić kwotę (np. przy nadpłacie)

#### 2. Wyświetlanie cen wizyt

Każda wizyta na liście pokazuje:
- Datę i godzinę
- **Cenę** (zielony tekst, format PLN)

```tsx
<div className="text-sm font-semibold text-green-600">
  {formatAmount(appointment.price || 0)}
</div>
```

#### 3. Podsumowanie wybranych wizyt

Pod listą wizyt wyświetlane są:
- Liczba wybranych wizyt
- **Suma cen** (zielony tekst)

#### 4. Walidacja kwoty w czasie rzeczywistym

W polu "Kwota (PLN)" pokazywane są:

**✅ Kwota pokrywa cenę wizyt** (zielony)
```
Kwota = Suma cen wizyt (±0.01 PLN)
```

**❌ Za mało** (czerwony)
```
"Za mało o 50.00 zł"
```

**⚠️ Nadpłata** (pomarańczowy, jeśli > 20%)
```
"Nadpłata: 100.00 zł"
```

**ℹ️ Nadpłata mała** (niebieski, jeśli < 20%)
```
"Nadpłata: 20.00 zł"
```

#### 5. Walidacja przed zapisem

Przed zapisaniem płatności system sprawdza:

**a) Czy kwota jest wystarczająca**
```javascript
if (formData.amount < totalAppointmentsPrice) {
  toast.error("Kwota jest mniejsza niż suma cen wizyt");
  return;
}
```

**b) Czy jest duża nadpłata (> 20%)**
```javascript
if (formData.amount > totalAppointmentsPrice * 1.2) {
  // Pokaż dialog potwierdzenia
  window.confirm("Kwota jest znacznie wyższa. Kontynuować?");
}
```

**c) Tylko powyższe dwie walidacje**
- Cena jest zawsze obecna (pole wymagane)

### PaymentDetail.tsx - Wyświetlanie szczegółów

#### Wyświetlanie ceny każdej wizyty

```tsx
{appointment.price && (
  <div className="text-sm text-green-600 font-semibold mt-1">
    💰 {formatAmount(appointment.price)}
  </div>
)}
```

#### Podsumowanie finansowe

Na dole listy wizyt wyświetlany jest panel z:

```
Suma cen wizyt:     300.00 zł
Kwota płatności:    350.00 zł
─────────────────────────────
Nadpłata:            50.00 zł
```

Lub:

```
Suma cen wizyt:     300.00 zł
Kwota płatności:    250.00 zł
─────────────────────────────
Niedopłata:          50.00 zł  (czerwony)
```

## Scenariusze użycia

### Scenariusz 1: Wszystkie wizyty mają cenę

**Dane:**
- Wizyta 1: 150.00 PLN
- Wizyta 2: 200.00 PLN
- Suma: 350.00 PLN

**Zachowanie:**
1. Użytkownik wybiera obie wizyty
2. Kwota automatycznie ustawia się na 350.00 PLN
3. Pokazuje się: "✅ Kwota pokrywa cenę wizyt"
4. Można zapisać bez ostrzeżeń

### Scenariusz 2: Niedopłata

**Dane:**
- Wizyta 1: 150.00 PLN
- Wizyta 2: 200.00 PLN
- Użytkownik wpisuje: 300.00 PLN

**Zachowanie:**
1. Pokazuje się: "❌ Za mało o 50.00 zł"
2. Przy próbie zapisu: błąd z toastem
3. Musi zwiększyć kwotę do minimum 350.00 PLN

### Scenariusz 3: Mała nadpłata (< 20%)

**Dane:**
- Wizyta 1: 150.00 PLN
- Użytkownik wpisuje: 160.00 PLN (6.7% więcej)

**Zachowanie:**
1. Pokazuje się: "ℹ️ Nadpłata: 10.00 zł" (niebieski)
2. Zapisuje się bez pytań
3. Nadpłata jest zarejestrowana w systemie

### Scenariusz 4: Duża nadpłata (> 20%)

**Dane:**
- Wizyta 1: 150.00 PLN
- Użytkownik wpisuje: 200.00 PLN (33% więcej)

**Zachowanie:**
1. Pokazuje się: "⚠️ Nadpłata: 50.00 zł" (pomarańczowy)
2. Przy zapisie: dialog potwierdzenia
3. Po potwierdzeniu: zapisuje się

### Scenariusz 5: Wizyta o niestandardowej cenie

**Dane:**
- Wizyta 1: 120.00 PLN (cena promocyjna)
- Wizyta 2: 180.00 PLN (sesja przedłużona)
- Suma: 300.00 PLN

**Zachowanie:**
1. Użytkownik wybiera obie wizyty
2. Kwota automatycznie ustawia się na 300.00 PLN
3. System akceptuje różne ceny wizyt
4. Płatność jest rejestrowana poprawnie

## Bezpieczeństwo i walidacja

### Po stronie backendu

✅ **Zawsze sprawdzane:**
- Czy wizyty należą do wybranego pacjenta
- Czy wizyty nie są już opłacone
- Czy wizyty istnieją w bazie

✅ **Zawsze sprawdzane:**
- Czy kwota >= suma cen wizyt (każda wizyta ma cenę)

⚠️ **Ostrzeżenia w logach:**
- Nadpłata > 20%

### Po stronie frontendu

✅ **Blokujące zapisu:**
- Brak pacjenta
- Brak wybranych wizyt
- Kwota <= 0
- Kwota < suma cen wizyt
- Brak ceny przy tworzeniu wizyty

⚠️ **Wymagające potwierdzenia:**
- Nadpłata > 20%

## Rekomendacje

### Dla użytkowników

1. **Cena wizyty jest wymagana** przy tworzeniu - nie można utworzyć wizyty bez ceny
2. Przy nadpłacie upewnij się, że to zamierzone (np. zaliczka na przyszłe wizyty)
3. Różne wizyty mogą mieć różne ceny (indywidualne, grupowe, online)

### Dla administratorów

1. **Monitoruj logi** pod kątem ostrzeżeń o nadpłatach

2. Rozważ **dodanie pola "cena domyślna"** w ustawieniach profilu do auto-wypełniania

3. **Statystyki cen wizyt:**
   ```sql
   -- Średnia cena wizyty
   SELECT AVG(price) FROM appointments;
   
   -- Najczęstsza cena
   SELECT price, COUNT(*) FROM appointments GROUP BY price ORDER BY COUNT(*) DESC;
   ```

## Przyszłe rozszerzenia

### Możliwe ulepszenia:

1. **Cena domyślna**
   - Ustawienie w profilu terapeuty
   - Automatyczne wypełnianie przy tworzeniu wizyty

2. **Różne cenniki**
   - Cena zależy od typu wizyty (indywidualna, grupowa, online)
   - Rabaty dla stałych pacjentów

3. **Pakiety wizyt**
   - Płatność za 10 wizyt z rabatem
   - Automatyczne przypisywanie do kolejnych wizyt

4. **Płatności częściowe**
   - Wielokrotne płatności za jedną wizytę
   - Śledzenie salda pacjenta

5. **Faktury**
   - Automatyczne generowanie faktur
   - Export do systemów księgowych

6. **Przypomnienia o płatnościach**
   - Email/SMS o nieopłaconych wizytach
   - Automatyczne powiadomienia

## Status zmian

✅ Backend: Walidacja zaimplementowana  
✅ Frontend: Formularz zaktualizowany  
✅ Frontend: Szczegóły płatności zaktualizowane  
✅ Walidacja po stronie klienta  
✅ Walidacja po stronie serwera  
✅ Pole price wymagane przy tworzeniu wizyty  
✅ Ostrzeżenia o nadpłacie  
✅ Dokumentacja utworzona

## Testowanie

### Test 1: Płatność za wizyty z ceną
```
1. Utwórz 2 wizyty z cenami 150 i 200 PLN
2. Przejdź do "Dodaj płatność"
3. Wybierz pacjenta
4. Zaznacz obie wizyty
5. Sprawdź czy kwota = 350 PLN
6. Zapisz
7. ✓ Płatność powinna być zapisana
```

### Test 2: Próba niedopłaty
```
1. Wybierz wizyty za 350 PLN
2. Zmień kwotę na 300 PLN
3. Spróbuj zapisać
4. ✓ Powinien pokazać się błąd
5. Zwiększ do 350 PLN
6. Zapisz
7. ✓ Płatność powinna być zapisana
```

### Test 3: Nadpłata mała
```
1. Wybierz wizytę za 150 PLN
2. Ustaw kwotę 160 PLN
3. Zapisz bez pytań
4. ✓ Płatność zapisana z nadpłatą 10 PLN
```

### Test 4: Nadpłata duża
```
1. Wybierz wizytę za 150 PLN
2. Ustaw kwotę 200 PLN
3. Spróbuj zapisać
4. ✓ Powinien pokazać się dialog potwierdzenia
5. Potwierdź
6. ✓ Płatność zapisana z nadpłatą 50 PLN
```

### Test 5: Próba utworzenia wizyty bez ceny
```
1. Otwórz formularz nowej wizyty
2. Wypełnij wszystkie pola OPRÓCZ ceny
3. Spróbuj zapisać
4. ✓ Powinien pokazać się błąd walidacji
5. "Cena wizyty jest wymagana"
6. Dodaj cenę (np. 150)
7. Zapisz
8. ✓ Wizyta utworzona poprawnie
```

## Pytania i odpowiedzi

**Q: Co jeśli zapomniałem ustawić cenę wizyty?**  
A: Nie można utworzyć wizyty bez ceny - pole jest wymagane. System nie pozwoli zapisać wizyty bez określenia ceny.

**Q: Czy mogę zapisać płatność za wizytę bez ceny?**  
A: Nie, ponieważ każda wizyta musi mieć cenę. Nie można utworzyć wizyty bez określenia ceny.

**Q: Czy mogę zapłacić więcej niż wynosi cena wizyt?**  
A: Tak, ale przy nadpłacie > 20% system poprosi o potwierdzenie.

**Q: Czy mogę zapłacić mniej niż wynosi cena wizyt?**  
A: Nie, system nie pozwoli na zapisanie płatności poniżej sumy cen wizyt.

**Q: Co się stanie z nadpłatą?**  
A: Nadpłata jest zapisana w systemie. W przyszłości można dodać funkcję automatycznego rozliczania z kolejnymi wizytami.

**Q: Czy ceny wizyt można zmieniać później?**  
A: Tak, możesz edytować cenę wizyty, ale zmiana nie wpływa na już zarejestrowane płatności.

**Q: Czy wszystkie wizyty muszą mieć tę samą cenę?**  
A: Nie, każda wizyta może mieć indywidualną cenę. Możesz różnicować ceny według typu wizyty (indywidualna, grupowa, online itp.).