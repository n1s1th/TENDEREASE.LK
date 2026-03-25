package lk.tenderease.common.util;

public class ValidationUtils {

    public static void requireNonNull(Object obj, String message) {
        if (obj == null) {
            throw new IllegalArgumentException(message);
        }
    }
}
