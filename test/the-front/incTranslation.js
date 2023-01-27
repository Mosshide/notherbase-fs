export default async (req, user) => {
    let att = await user.incrementAttribute("translation", 5);

    console.log(att);

    let check = await user.checkAttribute("translation", 4);

    console.log(check);
}