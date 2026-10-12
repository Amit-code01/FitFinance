package com.fitfinance.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity @Table(name="entries", indexes=@Index(name="idx_entry_user_kind_date", columnList="user_id,kind,entry_date"))
public class Entry {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
    @Column(nullable=false,length=24) private String kind;
    @Column(nullable=false,length=120) private String title;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal amount;
    @Column(nullable=false,length=32) private String category;
    @Column(name="entry_date",nullable=false) private LocalDate entryDate;
    @Column(length=500) private String description;
    @Column private Integer durationMinutes;
    @Column private Integer caloriesBurned;
    @Column private BigDecimal weight;
    @Column private Integer steps;
    @Column private Integer calories;
    @Column private BigDecimal targetValue;
    @Column private BigDecimal currentValue;
    @Column(length=24) private String unit;
    @Column private LocalDate deadline;
    @Column(length=24) private String status;
    @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
    protected Entry() {}
    public Entry(User user,String kind,String title,BigDecimal amount,String category,LocalDate date,String description,Integer duration,Integer caloriesBurned,BigDecimal weight,Integer steps,Integer calories,BigDecimal target,BigDecimal current,String unit,LocalDate deadline,String status){this.user=user;this.kind=kind;this.title=title;this.amount=amount;this.category=category;this.entryDate=date;this.description=description;this.durationMinutes=duration;this.caloriesBurned=caloriesBurned;this.weight=weight;this.steps=steps;this.calories=calories;this.targetValue=target;this.currentValue=current;this.unit=unit;this.deadline=deadline;this.status=status;}
    public void update(String title,BigDecimal amount,String category,LocalDate date,String description,Integer duration,Integer caloriesBurned,BigDecimal weight,Integer steps,Integer calories,BigDecimal target,BigDecimal current,String unit,LocalDate deadline,String status){this.title=title;this.amount=amount;this.category=category;this.entryDate=date;this.description=description;this.durationMinutes=duration;this.caloriesBurned=caloriesBurned;this.weight=weight;this.steps=steps;this.calories=calories;this.targetValue=target;this.currentValue=current;this.unit=unit;this.deadline=deadline;this.status=status;}
    public Long getId(){return id;} public User getUser(){return user;} public String getKind(){return kind;} public String getTitle(){return title;} public BigDecimal getAmount(){return amount;} public String getCategory(){return category;} public LocalDate getEntryDate(){return entryDate;} public String getDescription(){return description;} public Integer getDurationMinutes(){return durationMinutes;} public Integer getCaloriesBurned(){return caloriesBurned;} public BigDecimal getWeight(){return weight;} public Integer getSteps(){return steps;} public Integer getCalories(){return calories;} public BigDecimal getTargetValue(){return targetValue;} public BigDecimal getCurrentValue(){return currentValue;} public String getUnit(){return unit;} public LocalDate getDeadline(){return deadline;} public String getStatus(){return status;}
}
