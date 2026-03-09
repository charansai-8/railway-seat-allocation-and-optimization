public class Coach {

    private String coachId;
    private String type;
    private Berth[] berths;

    public Coach(String coachId, String type, int compartments) {
        this.coachId = coachId;
        this.type = type;

        berths = new Berth[compartments * 8];

        for (int i = 0; i < berths.length; i++) {
            berths[i] = new Berth(i + 1);
        }
    }

    public Berth allocateNextAvailable() {
        for (Berth b : berths) {
            if (!b.isBooked())
                return b;
        }
        return null;
    }

    public void freeBerth(int pnr) {
        for (Berth b : berths) {
            if (b.getPnr() == pnr) {
                b.free();
                return;
            }
        }
    }

    public void printMap() {
        for (int i = 0; i < berths.length; i++) {

            System.out.print(berths[i] + " ");

            if ((i + 1) % 8 == 0)
                System.out.println();
        }
    }

    public int totalBerths() {
        return berths.length;
    }

    public int bookedCount() {

        int count = 0;

        for (Berth b : berths)
            if (b.isBooked())
                count++;

        return count;
    }

    public String getCoachId() {
        return coachId;
    }
}