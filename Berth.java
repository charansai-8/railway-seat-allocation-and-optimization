public class Berth {

    private int number;
    private boolean booked;
    private int pnr;

    public Berth(int number) {
        this.number = number;
        booked = false;
    }

    public void book(int pnr) {
        this.pnr = pnr;
        booked = true;
    }

    public void free() {
        booked = false;
        pnr = 0;
    }

    public boolean isBooked() {
        return booked;
    }

    public int getPnr() {
        return pnr;
    }

    public String toString() {

        if (booked)
            return "[X]";
        else
            return "[" + number + "]";
    }
}