/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async headers() {
        return [
            {
                source: "/api/:path",
                headers: [
                    {
                      key: "Access-Control-Allow-Origin",
                      value: "*", // Set your origin
                    },
                    {
                      key: "Access-Control-Allow-Methods",
                      value: "GET, POST, PUT, DELETE, OPTIONS",
                    },
                ]
            }
        ];
    },
};

export default nextConfig;
