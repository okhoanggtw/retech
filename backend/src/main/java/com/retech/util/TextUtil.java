package com.retech.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class TextUtil {
    private TextUtil() {}

    private static final Pattern MARKS = Pattern.compile("\\p{M}+");

    /** "Điện thoại iPhone 15" -> "dien thoai iphone 15" */
    public static String normalize(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s.replace('đ', 'd').replace('Đ', 'D'), Normalizer.Form.NFD);
        return MARKS.matcher(n).replaceAll("").toLowerCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
    }

    /** "iPhone 15 Pro Max 256GB" -> "iphone-15-pro-max-256gb" */
    public static String slugify(String s) {
        return normalize(s).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    public static String formatVnd(long v) {
        return String.format(Locale.ROOT, "%,d", v).replace(',', '.') + "đ";
    }
}
