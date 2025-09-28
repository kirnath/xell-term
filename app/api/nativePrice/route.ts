

export async function POST(req: Request) {

    try{
        const response = await fetch(`${process.env.BACKEND_API_URL}/price?token=MINT_COMINGSOON&priceChanges=true`, {
        headers: {
            ...(process.env.BACKEND_API_KEY && { "x-api-key": `${process.env.BACKEND_API_KEY}` }),
            "Content-Type": "application/json",
        },
        })
        const result = await response.json()
        return new Response(JSON.stringify(result))

    }catch{
        throw new Error("API Problem")
    }

}