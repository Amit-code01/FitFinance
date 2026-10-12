package com.fitfinance.repository;
import com.fitfinance.entity.Entry; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface EntryRepository extends JpaRepository<Entry,Long>{List<Entry> findByUserIdAndKindOrderByEntryDateDesc(Long userId,String kind);Optional<Entry> findByIdAndUserIdAndKind(Long id,Long userId,String kind);}
