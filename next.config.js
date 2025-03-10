const nextConfig = {
	webpack: (config) => {
		config.externals.push({
			"harperdb": "commonjs harperdb"
		})

		return config;
	}
};

module.exports = nextConfig;
