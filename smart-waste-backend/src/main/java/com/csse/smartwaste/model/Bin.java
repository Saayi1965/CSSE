package com.csse.smartwaste.model;

public class Bin {
    private String id;
    private String location;
    private int level;

    public Bin() {}

    public Bin(String id, String location, int level) {
        this.id = id;
        this.location = location;
        this.level = level;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
}
