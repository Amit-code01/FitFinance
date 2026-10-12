
package com.fitfinance.service;

import com.fitfinance.dto.EntryDtos.*;
import com.fitfinance.entity.*;
import com.fitfinance.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;

@Service
public class EntryService {
    private final EntryRepository entries;
    private final UserRepository users;

    public EntryService(EntryRepository entries, UserRepository users) {
        this.entries = entries;
        this.users = users;
    }

    public List<EntryResponse> list(Long uid, String kind) {
        return entries.findByUserIdAndKindOrderByEntryDateDesc(uid, kind)
                .stream().map(this::view).toList();
    }

    public EntryResponse get(Long uid, String kind, Long id) {
        return view(owned(uid, kind, id));
    }

    public EntryResponse create(Long uid, String kind, EntryRequest r) {
        User u = users.findById(uid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        if (("expense".equals(kind) || "budget".equals(kind)) && r.amount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required");
        }

        if ("goal".equals(kind) && r.targetValue() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target is required");
        }

        BigDecimal amount = r.amount();

        if (amount == null &&
                ("workout".equals(kind) || "goal".equals(kind) || "health".equals(kind))) {
            amount = BigDecimal.ZERO;
        }

        if (amount == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required");
        }

        return view(entries.save(new Entry(
                u, kind, r.title(), amount, r.category(), r.date(),
                r.description(), r.durationMinutes(), r.caloriesBurned(),
                r.weight(), r.steps(), r.calories(), r.targetValue(),
                r.currentValue(), r.unit(), r.deadline(), r.status()
        )));
    }

    public EntryResponse update(Long uid, String kind, Long id, EntryRequest r) {
        Entry e = owned(uid, kind, id);

        BigDecimal amount = r.amount();

        if (amount == null &&
                ("workout".equals(kind) || "goal".equals(kind) || "health".equals(kind))) {
            amount = BigDecimal.ZERO;
        }

        if (("expense".equals(kind) || "budget".equals(kind)) && amount == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required");
        }

        if ("goal".equals(kind) && r.targetValue() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target is required");
        }

        if (amount == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required");
        }

        e.update(r.title(), amount, r.category(), r.date(), r.description(),
                r.durationMinutes(), r.caloriesBurned(), r.weight(), r.steps(),
                r.calories(), r.targetValue(), r.currentValue(), r.unit(),
                r.deadline(), r.status());

        return view(entries.save(e));
    }

    public void delete(Long uid, String kind, Long id) {
        entries.delete(owned(uid, kind, id));
    }

    private Entry owned(Long uid, String kind, Long id) {
        return entries.findByIdAndUserIdAndKind(id, uid, kind)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Resource not found"));
    }

    private EntryResponse view(Entry e) {
        return new EntryResponse(
                e.getId(), e.getKind(), e.getTitle(), e.getAmount(),
                e.getCategory(), e.getEntryDate(), e.getDescription(),
                e.getDurationMinutes(), e.getCaloriesBurned(), e.getWeight(),
                e.getSteps(), e.getCalories(), e.getTargetValue(),
                e.getCurrentValue(), e.getUnit(), e.getDeadline(), e.getStatus()
        );
    }
}
