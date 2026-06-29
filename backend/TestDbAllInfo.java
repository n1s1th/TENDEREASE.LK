import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDbAllInfo {
    public static void main(String[] args) {
        String[] dbNames = { "tenderease_user_db", "tenderease_tender_db", "tenderease_bid_db" };
        String[] queries = {
            "SELECT count(*) FROM vendor_profiles",
            "SELECT count(*) FROM tenders",
            "SELECT count(*) FROM bids"
        };
        String[] tables = { "vendor_profiles", "tenders", "bids" };

        String localHost = "jdbc:postgresql://localhost:5432/";
        String neonHost = "jdbc:postgresql://ep-nameless-haze-ao5zyycp-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/";

        System.out.println("=== LOCAL DATABASES ===");
        for (int i = 0; i < dbNames.length; i++) {
            try {
                Connection conn = DriverManager.getConnection(localHost + dbNames[i], "postgres", "postgres");
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(queries[i]);
                if (rs.next()) {
                    System.out.println("Local " + dbNames[i] + "." + tables[i] + " count: " + rs.getInt(1));
                }
                conn.close();
            } catch (Exception e) {
                System.out.println("Local " + dbNames[i] + " error: " + e.getMessage());
            }
        }

        System.out.println("\n=== NEON DATABASES ===");
        for (int i = 0; i < dbNames.length; i++) {
            try {
                String url = neonHost + dbNames[i] + "?sslmode=require";
                Connection conn = DriverManager.getConnection(url, "neondb_owner", "npg_wR9iIDYGj2ga");
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(queries[i]);
                if (rs.next()) {
                    System.out.println("Neon " + dbNames[i] + "." + tables[i] + " count: " + rs.getInt(1));
                }
                conn.close();
            } catch (Exception e) {
                System.out.println("Neon " + dbNames[i] + " error: " + e.getMessage());
            }
        }
    }
}
