package com.fitfinance.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="users", uniqueConstraints=@UniqueConstraint(name="uk_user_email", columnNames="email"))
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(nullable=false, unique=true) private String email;
    @Column(nullable=false) private String password;
    @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
    @Column(nullable=false) private Instant updatedAt=Instant.now();
    protected User() {}
    public User(String name,String email,String password){this.name=name;this.email=email;this.password=password;}
    @PreUpdate void touch(){updatedAt=Instant.now();}
    public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getPassword(){return password;}
}
