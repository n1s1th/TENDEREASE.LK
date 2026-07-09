import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CreateMissingDbs {
    public static void main(String[] args) {
        String[] dbNames = {
            "tenderease_workflow_db",
            "tenderease_user_db",
            "tenderease_tender_db",
            "tenderease_reporting_db",
            "tenderease_qa_db",
            "tenderease_payment_db",
            "tenderease_notification_db",
            "tenderease_evaluation_db",
            "tenderease_document_db",
            "tenderease_contract_db",
            "tenderease_clarification_db",
            "tenderease_bid_db",
            "tenderease_appeal_db"
        };

        String url = "jdbc:postgresql://ep-nameless-haze-ao5zyycp-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/tenderease_user_db?sslmode=require";
        String user = "neondb_owner";
        String pass = "npg_wR9iIDYGj2ga";

        try {
            System.out.println("Connecting to database 'tenderease_user_db' to check/create other databases...");
            Connection conn = DriverManager.getConnection(url, user, pass);
            Statement stmt = conn.createStatement();

            for (String db : dbNames) {
                // Check if database exists
                String checkSql = "SELECT 1 FROM pg_database WHERE datname = '" + db + "'";
                ResultSet rs = stmt.executeQuery(checkSql);
                boolean exists = rs.next();
                rs.close();

                if (exists) {
                    System.out.println("Database '" + db + "' already exists.");
                } else {
                    System.out.println("Database '" + db + "' does not exist. Creating it...");
                    try {
                        // CREATE DATABASE cannot run in a transaction, but Statement.executeUpdate runs it successfully
                        stmt.executeUpdate("CREATE DATABASE " + db);
                        System.out.println("Successfully created database '" + db + "'.");
                    } catch (Exception ex) {
                        System.err.println("Failed to create database '" + db + "': " + ex.getMessage());
                    }
                }
            }
            conn.close();
            System.out.println("Finished check and creation of missing databases.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
