package lk.tenderease.qa.config;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.Nullable;

import java.time.Duration;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class CacheConfig {

    @Bean
    CacheManager cacheManager() {
        return new TtlCacheManager("qa:questions", Duration.ofMinutes(5));
    }

    static class TtlCacheManager implements CacheManager {

        private final Map<String, Cache> caches;

        TtlCacheManager(String cacheName, Duration ttl) {
            this.caches = Map.of(cacheName, new TtlCache(cacheName, ttl));
        }

        @Override
        @Nullable
        public Cache getCache(String name) {
            return caches.get(name);
        }

        @Override
        public Collection<String> getCacheNames() {
            return caches.keySet();
        }
    }

    static class TtlCache implements Cache {

        private final String name;
        private final Duration ttl;
        private final Map<Object, CacheEntry> entries = new ConcurrentHashMap<>();

        TtlCache(String name, Duration ttl) {
            this.name = name;
            this.ttl = ttl;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public Object getNativeCache() {
            return entries;
        }

        @Override
        @Nullable
        public ValueWrapper get(Object key) {
            CacheEntry entry = entries.get(key);
            if (entry == null || entry.isExpired()) {
                entries.remove(key);
                return null;
            }
            return () -> entry.value();
        }

        @Override
        @Nullable
        @SuppressWarnings("unchecked")
        public <T> T get(Object key, @Nullable Class<T> type) {
            ValueWrapper wrapper = get(key);
            Object value = wrapper == null ? null : wrapper.get();
            if (value != null && type != null && !type.isInstance(value)) {
                throw new IllegalStateException("Cached value is not of required type " + type.getName());
            }
            return (T) value;
        }

        @Override
        @Nullable
        @SuppressWarnings("unchecked")
        public <T> T get(Object key, Callable<T> valueLoader) {
            ValueWrapper wrapper = get(key);
            if (wrapper != null) {
                return (T) wrapper.get();
            }

            try {
                T value = valueLoader.call();
                put(key, value);
                return value;
            } catch (Exception ex) {
                throw new ValueRetrievalException(key, valueLoader, ex);
            }
        }

        @Override
        public void put(Object key, @Nullable Object value) {
            entries.put(key, new CacheEntry(value, System.currentTimeMillis() + ttl.toMillis()));
        }

        @Override
        @Nullable
        public ValueWrapper putIfAbsent(Object key, @Nullable Object value) {
            CacheEntry newEntry = new CacheEntry(value, System.currentTimeMillis() + ttl.toMillis());
            CacheEntry existing = entries.putIfAbsent(key, newEntry);
            if (existing == null || existing.isExpired()) {
                entries.put(key, newEntry);
                return null;
            }
            return () -> existing.value();
        }

        @Override
        public void evict(Object key) {
            entries.remove(key);
        }

        @Override
        public boolean evictIfPresent(Object key) {
            return entries.remove(key) != null;
        }

        @Override
        public void clear() {
            entries.clear();
        }

        @Override
        public boolean invalidate() {
            boolean hadEntries = !entries.isEmpty();
            entries.clear();
            return hadEntries;
        }

        private record CacheEntry(@Nullable Object value, long expiresAt) {

            boolean isExpired() {
                return System.currentTimeMillis() >= expiresAt;
            }
        }
    }
}
