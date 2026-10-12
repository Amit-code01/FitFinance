package com.fitfinance.controller;
import com.fitfinance.dto.EntryDtos.*;import com.fitfinance.service.EntryService;import jakarta.validation.Valid;import org.springframework.security.core.Authentication;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api") public class EntryController {private final EntryService service;public EntryController(EntryService service){this.service=service;}
 @GetMapping("/{resource}") public List<EntryResponse> list(@PathVariable String resource,Authentication auth){return service.list(uid(auth),kind(resource));}
 @GetMapping("/{resource}/{id}") public EntryResponse get(@PathVariable String resource,@PathVariable Long id,Authentication auth){return service.get(uid(auth),kind(resource),id);}
 @PostMapping("/{resource}") public EntryResponse create(@PathVariable String resource,@Valid @RequestBody EntryRequest r,Authentication auth){return service.create(uid(auth),kind(resource),r);}
 @PutMapping("/{resource}/{id}") public EntryResponse update(@PathVariable String resource,@PathVariable Long id,@Valid @RequestBody EntryRequest r,Authentication auth){return service.update(uid(auth),kind(resource),id,r);}
 @DeleteMapping("/{resource}/{id}") public void delete(@PathVariable String resource,@PathVariable Long id,Authentication auth){service.delete(uid(auth),kind(resource),id);}
 private Long uid(Authentication a){return (Long)a.getPrincipal();} private String kind(String r){return switch(r){case "expenses"->"expense";case "workouts"->"workout";case "health-metrics"->"health";case "goals"->"goal";case "budget"->"budget";default->throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND,"Resource not found");};}}
