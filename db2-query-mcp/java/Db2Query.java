import java.sql.*;
import org.json.JSONArray;
import org.json.JSONObject;

public class Db2Query {

    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: java Db2Query <mode> [arguments]");
            System.exit(1);
        }

        String mode = args[0];

        try {
            switch (mode) {
                case "query":
                    executeQuery(args);
                    break;
                case "tables":
                    queryTables(args);
                    break;
                case "columns":
                    queryColumns(args);
                    break;
                case "info":
                    getDatabaseInfo(args);
                    break;
                default:
                    System.err.println("Unknown mode: " + mode);
                    System.exit(1);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void executeQuery(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Usage: java Db2Query query <sql> [limit] [offset]");
            System.exit(1);
        }

        String sql = args[1];
        int limit = args.length >= 3 ? Integer.parseInt(args[2]) : 200;
        int offset = args.length >= 4 ? Integer.parseInt(args[3]) : 0;

        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            conn = getConnection();
            stmt = conn.createStatement();

            if (offset > 0) {
                String trimmedSql = sql.trim();
                if (trimmedSql.endsWith(";")) {
                    trimmedSql = trimmedSql.substring(0, trimmedSql.length() - 1);
                }
                String paginatedSql = trimmedSql + " OFFSET " + offset + " ROWS FETCH NEXT " + limit + " ROWS ONLY";
                rs = stmt.executeQuery(paginatedSql);
            } else {
                stmt.setMaxRows(limit);
                rs = stmt.executeQuery(sql);
            }

            System.out.println(resultSetToJson(rs));
        } finally {
            if (rs != null) try { rs.close(); } catch (Exception e) {}
            if (stmt != null) try { stmt.close(); } catch (Exception e) {}
            if (conn != null) try { conn.close(); } catch (Exception e) {}
        }
    }

    private static void queryTables(String[] args) throws Exception {
        String tableNamePattern = args.length >= 2 ? args[1] : "%";
        String schema = args.length >= 3 ? args[2] : System.getenv("DB2_SCHEMA");
        int limit = args.length >= 4 ? Integer.parseInt(args[3]) : 200;

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = getConnection();
            String sql = "SELECT TABSCHEMA, TABNAME, TYPE, REMARKS FROM SYSCAT.TABLES " +
                        "WHERE TABSCHEMA LIKE ? AND TABNAME LIKE ? AND TYPE IN ('T', 'V') " +
                        "ORDER BY TABSCHEMA, TABNAME " +
                        "FETCH FIRST ? ROWS ONLY";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, schema);
            stmt.setString(2, tableNamePattern);
            stmt.setInt(3, limit);
            rs = stmt.executeQuery();

            System.out.println(resultSetToJson(rs));
        } finally {
            if (rs != null) try { rs.close(); } catch (Exception e) {}
            if (stmt != null) try { stmt.close(); } catch (Exception e) {}
            if (conn != null) try { conn.close(); } catch (Exception e) {}
        }
    }

    private static void queryColumns(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Usage: java Db2Query columns <tableName> [schema]");
            System.exit(1);
        }

        String tableName = args[1];
        String schema = args.length >= 3 ? args[2] : System.getenv("DB2_SCHEMA");

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = getConnection();
            String sql = "SELECT COLNAME, TYPENAME, LENGTH, SCALE, NULLS, DEFAULT, REMARKS " +
                        "FROM SYSCAT.COLUMNS " +
                        "WHERE TABSCHEMA = ? AND TABNAME = ? " +
                        "ORDER BY COLNO";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, schema);
            stmt.setString(2, tableName);
            rs = stmt.executeQuery();

            System.out.println(resultSetToJson(rs));
        } finally {
            if (rs != null) try { rs.close(); } catch (Exception e) {}
            if (stmt != null) try { stmt.close(); } catch (Exception e) {}
            if (conn != null) try { conn.close(); } catch (Exception e) {}
        }
    }

    private static void getDatabaseInfo(String[] args) throws Exception {
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            conn = getConnection();
            stmt = conn.createStatement();
            rs = stmt.executeQuery(
                "SELECT CURRENT SERVER AS DB_NAME, CURRENT USER AS DB_USER, CURRENT SCHEMA AS DB_SCHEMA " +
                "FROM SYSIBM.SYSDUMMY1");

            System.out.println(resultSetToJson(rs));
        } finally {
            if (rs != null) try { rs.close(); } catch (Exception e) {}
            if (stmt != null) try { stmt.close(); } catch (Exception e) {}
            if (conn != null) try { conn.close(); } catch (Exception e) {}
        }
    }

    private static Connection getConnection() throws Exception {
        String jdbcUrl = System.getenv("DB2_JDBC_URL");
        String username = System.getenv("DB2_USERNAME");
        String password = System.getenv("DB2_PASSWORD");

        System.err.println("DEBUG: JDBC_URL = " + jdbcUrl);
        System.err.println("DEBUG: USERNAME = " + username);
        
        if (jdbcUrl == null || username == null || password == null) {
            throw new Exception("Missing required environment variables: DB2_JDBC_URL, DB2_USERNAME, DB2_PASSWORD");
        }

        Class.forName("com.ibm.db2.jcc.DB2Driver");
        return DriverManager.getConnection(jdbcUrl, username, password);
    }

    private static String resultSetToJson(ResultSet rs) throws Exception {
        ResultSetMetaData metaData = rs.getMetaData();
        int columnCount = metaData.getColumnCount();
        JSONArray columns = new JSONArray();
        for (int i = 1; i <= columnCount; i++) {
            columns.put(metaData.getColumnLabel(i));
        }

        JSONArray rows = new JSONArray();
        while (rs.next()) {
            JSONObject row = new JSONObject();
            for (int i = 1; i <= columnCount; i++) {
                Object value = rs.getObject(i);
                if (value == null) {
                    row.put(metaData.getColumnLabel(i), JSONObject.NULL);
                } else if (value instanceof Number) {
                    row.put(metaData.getColumnLabel(i), value);
                } else {
                    row.put(metaData.getColumnLabel(i), value.toString());
                }
            }
            rows.put(row);
        }

        JSONObject result = new JSONObject();
        result.put("columns", columns);
        result.put("rows", rows);
        result.put("rowCount", rows.length());
        result.put("truncated", false);

        return result.toString(0);
    }
}