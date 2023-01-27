export default async (req, user) => {
    await user.offsetItem("Gold Coin", 3);
}