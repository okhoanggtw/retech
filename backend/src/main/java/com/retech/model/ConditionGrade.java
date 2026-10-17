package com.retech.model;

/** Tinh trang may cu va he so gia so voi may "nhu moi" */
public enum ConditionGrade {
    LIKE_NEW("Như mới 99%", 1.00),
    EXCELLENT("Đẹp 95-98%", 0.93),
    GOOD("Tốt 90-94%", 0.85),
    FAIR("Khá 80-89%", 0.74),
    WORN("Trầy xước nhiều <80%", 0.60);

    public final String label;
    public final double factor;

    ConditionGrade(String label, double factor) {
        this.label = label;
        this.factor = factor;
    }
}
