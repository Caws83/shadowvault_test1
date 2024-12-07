const socialLinks = {
    109: {
        '0xf32dd87d69070377c909680e0ce45f6eda9066df': "https://t.me/MickeyBoat_official/",
        '0xae12763590a4a77d69d1d528f716428f587aa4be': "https://yuantoken.io/",
        "0xB1c8Ba9E959411744a0A9b25E64143Aecf3dD5e2" : "https://t.me/KEKonShibarium"
    }
};

const socialLinksLowerCase = Object.fromEntries(
    Object.entries(socialLinks).map(([chainId, links]) => [
        chainId,
        Object.fromEntries(
            Object.entries(links).map(([key, value]) => [
                key.toLowerCase(),
                value
            ])
        )
    ])
);

const getSocials = (chainId, address) => {
    if (socialLinksLowerCase.hasOwnProperty(chainId)) {
        const socials = socialLinksLowerCase[chainId][address.toLowerCase()];
        return socials ?? "";
    } else {
        return ""; // or you can throw an error here if desired
    }
};

export default getSocials;
