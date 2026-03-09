public class Ticket {

    private int pnr;
    private String name;
    private int age;
    private String quota;
    private String status;
    private String berthInfo;
    private int priority;

    public Ticket(int pnr, String name, int age, String quota, int daysAhead) {

        this.pnr = pnr;
        this.name = name;
        this.age = age;
        this.quota = quota;
    }

    public int getPnr() {
        return pnr;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public String getQuota() {
        return quota;
    }

    public String getStatus() {
        return status;
    }

    public String getBerthInfo() {
        return berthInfo;
    }

    public int getPriority() {
        return priority;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setBerthInfo(String berthInfo) {
        this.berthInfo = berthInfo;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String fullDetails() {

        return "PNR: " + pnr +
                "\nName: " + name +
                "\nAge: " + age +
                "\nQuota: " + quota +
                "\nStatus: " + status +
                "\nBerth: " + berthInfo;
    }
}