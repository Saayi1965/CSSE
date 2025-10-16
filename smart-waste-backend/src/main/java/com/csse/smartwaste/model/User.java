// package com.csse.smartwaste.model;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;

// @Document(collection = "users")
// public class User {
//     @Id
//     private String id;
//     private String username;
//     private String password; // stored hashed
//     private Role role;

//     public User() {}

//     public User(String username, String password, Role role) {
//         this.username = username;
//         this.password = password;
//         this.role = role;
//     }

//     public String getId() { return id; }
//     public void setId(String id) { this.id = id; }

//     public String getUsername() { return username; }
//     public void setUsername(String username) { this.username = username; }

//     public String getPassword() { return password; }
//     public void setPassword(String password) { this.password = password; }

//     public Role getRole() { return role; }
//     public void setRole(Role role) { this.role = role; }
// }
package com.csse.smartwaste.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    private String password;
    private Role role;
    
    // Constructors
    public User() {}
    
    public User(String username, String password, Role role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    @Override
    public String toString() {
        return "User{id='" + id + "', username='" + username + "', role=" + role + '}';
    }
}