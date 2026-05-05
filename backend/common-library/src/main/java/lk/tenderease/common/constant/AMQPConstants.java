package lk.tenderease.common.constant;

public class AMQPConstants {
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.routing.key";
    public static final String CLARIFICATION_CREATED_ROUTING_KEY = "clarification.created";
    public static final String CLARIFICATION_ANSWERED_ROUTING_KEY = "clarification.answered";

    // CAO Dashboard / Reporting
    public static final String REPORTING_EXCHANGE = "reporting.exchange";
    public static final String KPI_TENDER_ROUTING_KEY = "kpi.tender";
    public static final String KPI_USER_ROUTING_KEY = "kpi.user";
}
