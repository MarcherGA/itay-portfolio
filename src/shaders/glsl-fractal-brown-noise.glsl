float fbm3d(vec3 x, const in int it) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);

    for (int i = 0; i < 32; ++i) {
        if (i < it) {
            v += a * snoise(x); // use snoise directly
            x = x * 2.0 + shift;
            a *= 0.5;
        }
    }
    return v;
}
