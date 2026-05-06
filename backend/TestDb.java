import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.ResultSetMetaData;
public class TestDb {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/tenderease_user_db", "postgres", "postgres");
            Statement stmt = conn.createStatement();
            
            System.out.println("--- VENDOR PROFILE ---");
            ResultSet rs = stmt.executeQuery("SELECT id, business_name, registration_number, official_email, status, terms_accepted FROM vendor_profiles");
            while (rs.next()) {
                System.out.printf("ID: %s | Name: %s | Reg No: %s | Email: %s | Status: %s | Terms Accepted: %s%n", 
                    rs.getString("id"), rs.getString("business_name"), rs.getString("registration_number"), 
                    rs.getString("official_email"), rs.getString("status"), rs.getString("terms_accepted"));
            }
            
            System.out.println("\n--- VENDOR DOCUMENTS ---");
            rs = stmt.executeQuery("SELECT document_type, original_file_name, file_path FROM vendor_documents");
            while (rs.next()) {
                System.out.printf("Type: %s | File: %s%nPath: %s%n", 
                    rs.getString("document_type"), rs.getString("original_file_name"), rs.getString("file_path"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
